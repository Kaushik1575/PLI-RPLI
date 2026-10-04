import React, { useState } from 'react';
import { History, Search, CheckCircle2, AlertTriangle, Clock, Trash2, Mail, ExternalLink } from 'lucide-react';
import { EmailLog } from '../types';
import { formatFriendlyDate } from '../utils/dateUtils';

interface DeliveryLogsProps {
  logs: EmailLog[];
  onClearLogs: () => void;
}

export const DeliveryLogs: React.FC<DeliveryLogsProps> = ({ logs, onClearLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'simulated' | 'failed'>('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.policy_number.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && log.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-red-500" />
            Email Dispatch & Audit Logs
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time delivery history, Resend API message IDs, and recipient tracking for birthday notifications.
          </p>
        </div>

        {logs.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear all email dispatch logs?')) {
                onClearLogs();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs by recipient, email, or policy number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['all', 'sent', 'simulated', 'failed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                statusFilter === st
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Recipient</th>
                <th className="py-3.5 px-4">Policy / Scheme</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Dispatched At</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6">Resend ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <p className="text-base font-semibold text-slate-400">No dispatch records found</p>
                    <p className="text-xs text-slate-500 mt-1">Send a birthday greeting from the Command Hub or Policyholders directory to populate logs.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const date = new Date(log.sent_at);
                  const formattedTime = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                  const formattedDate = formatFriendlyDate(log.sent_at);

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-bold text-white text-sm">{log.client_name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {log.client_email}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-semibold text-slate-300">{log.policy_number}</div>
                        <div className="text-xs text-red-300/80">{log.policy_type}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-xs text-slate-300" title={log.subject}>
                        {log.subject}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-300">
                        <div>{formattedDate}</div>
                        <div className="text-[11px] text-slate-500">{formattedTime}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {log.status === 'sent' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                          </span>
                        )}
                        {log.status === 'simulated' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3.5 h-3.5" /> Simulated
                          </span>
                        )}
                        {log.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full">
                            <AlertTriangle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-slate-400">
                        {log.resend_id ? (
                          <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            {log.resend_id}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
