import React from 'react';
import { Mail, Sparkles, Send, Users, FileText, Settings, History, ShieldCheck, Clock } from 'lucide-react';
import { AgentProfile, BirthdayStats } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  stats: BirthdayStats;
  agent: AgentProfile;
  resendConnected: boolean;
  supabaseConnected: boolean;
  simulationMode: boolean;
  onOpenScheduler: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  stats,
  agent,
  resendConnected,
  supabaseConnected,
  simulationMode,
  onOpenScheduler,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Command Hub', icon: Sparkles, badge: stats.todayCount > 0 ? stats.todayCount : undefined },
    { id: 'clients', label: 'Policyholders', icon: Users, count: stats.totalClients },
    { id: 'templates', label: 'Email Templates', icon: FileText },
    { id: 'logs', label: 'Dispatch Logs', icon: History, count: stats.totalSentCount },
    { id: 'settings', label: 'Integrations & Agent', icon: Settings },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner for India Post Postal Life Insurance */}
      <div className="bg-gradient-to-r from-red-900 via-postal-700 to-red-950 px-4 py-1.5 text-xs font-semibold text-amber-200 border-b border-red-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-red-950/80 text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase border border-red-700">
            🇮🇳 India Post • PLI / RPLI
          </span>
          <span className="hidden sm:inline text-red-100 font-normal">
            Automated Birthday Greetings & Policyholder Relationship System
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScheduler}
            className="flex items-center gap-1.5 bg-red-950/60 hover:bg-red-950 text-amber-200 px-2.5 py-0.5 rounded-full border border-red-700/50 transition-colors text-[11px]"
            title="Configure Automatic Daily Dispatch Cron"
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Daily Auto-Send: {agent.auto_send_enabled ? `ON (${agent.auto_send_time})` : 'OFF'}</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
              simulationMode 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : resendConnected 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-slate-700/50 text-slate-300 border border-slate-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${simulationMode ? 'bg-amber-400 animate-pulse' : resendConnected ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
              {simulationMode ? 'Resend: Simulation Mode' : resendConnected ? 'Resend: Live API' : 'Resend: Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Agent Info */}
          <div className="flex items-center gap-3">
            <img
              src="/POSTOFFICELOGO.jpg"
              alt="India Post Logo"
              className="w-11 h-11 rounded-xl object-contain shadow-md shadow-red-900/30 border border-red-500/40 bg-red-600 p-0.5"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  DakPost <span className="text-red-500 font-black">PLI</span>
                </span>
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {agent.agent_name} <span className="text-slate-600">•</span> {agent.agency_code}
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-amber-400 text-slate-950 rounded-full animate-bounce">
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && !tab.badge && (
                    <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-red-700 text-red-100' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
