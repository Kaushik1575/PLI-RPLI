import React, { useState } from 'react';
import { 
  Cake, 
  Send, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  ArrowRight, 
  Mail, 
  ShieldCheck, 
  RefreshCw,
  PhoneCall,
  Flame,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Client, AgentProfile, EmailTemplate, EmailLog, BirthdayStats } from '../types';
import { isBirthdayToday, getDaysUntilBirthday, calculateAge, formatBirthdayMonthDay } from '../utils/dateUtils';

interface DashboardProps {
  clients: Client[];
  agent: AgentProfile;
  templates: EmailTemplate[];
  logs: EmailLog[];
  stats: BirthdayStats;
  onSendSingleEmail: (client: Client) => Promise<void>;
  onSendAllToday: () => Promise<void>;
  onPreviewClientEmail: (client: Client) => void;
  onNavigateTab: (tab: string) => void;
  onOpenScheduler: () => void;
  isSendingBulk: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  clients,
  agent,
  templates,
  logs,
  stats,
  onSendSingleEmail,
  onSendAllToday,
  onPreviewClientEmail,
  onNavigateTab,
  onOpenScheduler,
  isSendingBulk,
}) => {
  const [sendingClientId, setSendingClientId] = useState<string | null>(null);

  // Filter clients with birthdays today
  const todayBirthdays = clients.filter(c => isBirthdayToday(c.date_of_birth));

  // Upcoming in the next 14 days (excluding today)
  const upcomingBirthdays = clients
    .filter(c => {
      const days = getDaysUntilBirthday(c.date_of_birth);
      return days > 0 && days <= 14;
    })
    .sort((a, b) => getDaysUntilBirthday(a.date_of_birth) - getDaysUntilBirthday(b.date_of_birth));

  // Check if a client was already sent an email today
  const hasSentToday = (clientId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return logs.some(log => log.client_id === clientId && log.sent_at.startsWith(todayStr) && log.status === 'sent');
  };

  const handleSendSingle = async (client: Client) => {
    setSendingClientId(client.id);
    try {
      await onSendSingleEmail(client);
    } finally {
      setSendingClientId(null);
    }
  };

  const handleBulkSendWithConfetti = async () => {
    await onSendAllToday();
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // fallback if canvas-confetti fails
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 border border-red-900/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-40 bottom-0 -mb-12 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-300 border border-red-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Postal Life Insurance Agent Dashboard
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Namaste, <span className="bg-gradient-to-r from-red-400 via-amber-200 to-amber-400 bg-clip-text text-transparent">{agent.agent_name}</span>
            </h1>
            
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              {todayBirthdays.length > 0 ? (
                <>
                  You have <span className="font-bold text-amber-400 text-lg">{todayBirthdays.length}</span> policyholder{todayBirthdays.length > 1 ? 's' : ''} celebrating their birthday today! Automated warm greetings strengthen trust and boost policy renewal rates.
                </>
              ) : (
                <>
                  No birthdays scheduled for today. {upcomingBirthdays.length} policyholders have birthdays approaching in the next fortnight.
                </>
              )}
            </p>
          </div>

          {/* Quick Action Button in Hero */}
          <div className="flex flex-wrap items-center gap-3">
            {todayBirthdays.length > 0 && (
              <button
                onClick={handleBulkSendWithConfetti}
                disabled={isSendingBulk}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-lg shadow-red-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                {isSendingBulk ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Dispatching via Resend...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send All Greetings ({todayBirthdays.length})</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onOpenScheduler}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 font-semibold border border-slate-700 transition-colors text-sm"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Auto-Send Scheduler</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Birthdays Card */}
        <div className={`p-5 rounded-2xl border transition-all ${
          todayBirthdays.length > 0
            ? 'bg-gradient-to-br from-red-950/60 to-slate-900/80 border-red-700/50 shadow-lg shadow-red-950/40'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-300">Today's Birthdays</span>
            <div className={`p-2 rounded-xl ${todayBirthdays.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
              <Cake className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.todayCount}</span>
            <span className="text-xs text-slate-400">clients today</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {todayBirthdays.filter(c => hasSentToday(c.id)).length} of {todayBirthdays.length} greeting emails delivered
          </p>
        </div>

        {/* This Week's Birthdays Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Next 7 Days</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.thisWeekCount}</span>
            <span className="text-xs text-slate-400">upcoming celebrants</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Early preparation & relationship building
          </p>
        </div>

        {/* Total Policyholders Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Total Policyholders</span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.totalClients}</span>
            <span className="text-xs text-slate-400">in your agency</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>PLI & RPLI schemes</span>
            <button onClick={() => onNavigateTab('clients')} className="text-blue-400 hover:underline">View all</button>
          </p>
        </div>

        {/* Total Greetings Sent Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Greetings Dispatched</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.totalSentCount}</span>
            <span className="text-xs text-slate-400">delivered</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Via Resend service</span>
            <button onClick={() => onNavigateTab('logs')} className="text-emerald-400 hover:underline">View logs</button>
          </p>
        </div>

      </div>

      {/* Main Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 spans): Today's Birthdays Action Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Today's Birthday Celebrants
                <span className="px-2 py-0.5 text-xs font-extrabold bg-red-600 text-white rounded-full">
                  {todayBirthdays.length}
                </span>
              </h2>
            </div>
            {todayBirthdays.length > 0 && (
              <span className="text-xs text-slate-400">
                Dispatched with your official Postal Agency branding
              </span>
            )}
          </div>

          {todayBirthdays.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <Cake className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-200">No birthdays for today</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                All policyholder records checked for today's date ({new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}). You can test sending a greeting to any client using the button below.
              </p>
              {clients.length > 0 && (
                <button
                  onClick={() => onPreviewClientEmail(clients[0])}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/80 px-4 py-2 rounded-xl border border-red-800/40 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Birthday Email for {clients[0].name}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {todayBirthdays.map((client) => {
                const sent = hasSentToday(client.id);
                const age = calculateAge(client.date_of_birth);
                const isThisSending = sendingClientId === client.id;

                return (
                  <div
                    key={client.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-red-600/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 flex-shrink-0">
                        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-amber-300 text-lg">
                          🎂
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-base">{client.name}</h4>
                          <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                            Turning {age} today!
                          </span>
                          {sent ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Sent Today
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                              <Clock className="w-3 h-3" /> Pending Greeting
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span className="font-mono text-slate-300">{client.policy_number}</span>
                          <span>•</span>
                          <span className="text-red-300">{client.policy_type}</span>
                          <span>•</span>
                          <span>{client.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onPreviewClientEmail(client)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Preview Greeting Email"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleSendSingle(client)}
                        disabled={isThisSending || isSendingBulk}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                          sent
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20'
                        } disabled:opacity-50`}
                      >
                        {isThisSending ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : sent ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Re-send</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Greeting</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Postal Agent Insight Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-red-950/30 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-600/20 text-red-400 flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white mb-0.5">India Post Client Retention Best Practice:</p>
              <p className="text-slate-400">
                Personalized birthday greetings from Postal Agents improve relationship trust, prompt on-time premium deposits, and often yield word-of-mouth policy referrals for children plans (Bal Jeevan Bima) and spouse plans (Yugal Suraksha).
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Upcoming Birthdays & Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Upcoming in 14 Days
            </h2>
            <button
              onClick={() => onNavigateTab('clients')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingBirthdays.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
                No birthdays in the next 14 days.
              </div>
            ) : (
              upcomingBirthdays.slice(0, 5).map((client) => {
                const days = getDaysUntilBirthday(client.date_of_birth);
                const age = calculateAge(client.date_of_birth);

                return (
                  <div
                    key={client.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <h5 className="font-semibold text-sm text-slate-200">{client.name}</h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatBirthdayMonthDay(client.date_of_birth)} • Will turn {age}
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        days === 1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {days === 1 ? 'Tomorrow!' : `In ${days} days`}
                      </span>
                      <button
                        onClick={() => onPreviewClientEmail(client)}
                        className="text-[11px] text-red-400 hover:text-red-300 mt-1"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Recent Delivery Activity Card */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Recent Delivery Logs
              </h3>
              <button
                onClick={() => onNavigateTab('logs')}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                All logs
              </button>
            </div>

            <div className="space-y-2">
              {logs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <p className="font-medium text-slate-200 truncate">{log.client_name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{log.policy_number}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                    log.status === 'sent'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : log.status === 'simulated'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {log.status === 'simulated' ? 'Simulated' : log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
