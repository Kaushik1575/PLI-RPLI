import React, { useState } from 'react';
import { X, Clock, Play, CheckCircle2, ShieldCheck, Sparkles, Terminal, Copy, CheckCheck } from 'lucide-react';
import { AgentProfile } from '../types';

interface AutoSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentProfile;
  onUpdateAgent: (agent: AgentProfile) => void;
  onRunScheduledTrigger: () => Promise<void>;
  isRunning: boolean;
  todayCount: number;
}

export const AutoSchedulerModal: React.FC<AutoSchedulerModalProps> = ({
  isOpen,
  onClose,
  agent,
  onUpdateAgent,
  onRunScheduledTrigger,
  isRunning,
  todayCount,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [autoEnabled, setAutoEnabled] = useState(agent.auto_send_enabled);
  const [sendTime, setSendTime] = useState(agent.auto_send_time || '08:00 AM');

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateAgent({
      ...agent,
      auto_send_enabled: autoEnabled,
      auto_send_time: sendTime,
    });
    onClose();
  };

  const cronCodeSnippet = `// Supabase Edge Function (supabase/functions/birthday-cron/index.ts)
// Runs automatically every morning at 08:00 AM IST via pg_cron
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";
import { createClient } from "npm:@supabase/supabase-js";

serve(async () => {
  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 1. Query today's birthday policyholders
  const today = new Date();
  const m = today.getMonth() + 1;
  const d = today.getDate();

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .filter("date_of_birth", "gte", "1900-01-01");

  const todayClients = (clients || []).filter(c => {
    const dob = new Date(c.date_of_birth);
    return dob.getMonth() + 1 === m && dob.getDate() === d;
  });

  // 2. Dispatch personalized greeting emails via Resend
  for (const client of todayClients) {
    await resend.emails.send({
      from: "Postal Agent <onboarding@resend.dev>",
      to: client.email,
      subject: "Warm Birthday Greetings from Your Postal Life Insurance Agent! 🎂📮",
      html: \`<h1>Happy Birthday, \${client.name}!</h1><p>Wishing you joy and protection under your PLI policy (\${client.policy_number}).</p>\`
    });
  }

  return new Response(JSON.stringify({ dispatched: todayClients.length }), {
    headers: { "Content-Type": "application/json" }
  });
});`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Automatic Daily Birthday Dispatcher</h3>
              <p className="text-xs text-slate-400">
                Ensure policyholders receive morning greetings without manual effort every day.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Toggle Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-sm">Enable Daily Auto-Greeting</div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically checks for birthdays every morning and sends emails to your policyholders.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoEnabled}
                onChange={(e) => setAutoEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Time Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Morning Send Time
              </label>
              <select
                value={sendTime}
                onChange={(e) => setSendTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
              >
                <option value="07:00 AM">07:00 AM (Early Morning Blessing)</option>
                <option value="08:00 AM">08:00 AM (Recommended Peak Time)</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Timezone
              </label>
              <input
                type="text"
                disabled
                value="IST (Indian Standard Time, UTC+05:30)"
                className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Instant Trigger Simulation Button */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Simulate Morning Cron Trigger Now
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Executes the morning check right now for today's celebrants ({todayCount} policyholder{todayCount !== 1 ? 's' : ''}).
              </p>
            </div>

            <button
              onClick={onRunScheduledTrigger}
              disabled={isRunning || todayCount === 0}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all disabled:opacity-50 flex-shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Running Cron...' : 'Run Morning Check'}</span>
            </button>
          </div>

          {/* Cloud Cron / Edge Function Instructions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-slate-400" />
                Serverless 24/7 Supabase Edge Function Code:
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cronCodeSnippet);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2500);
                }}
                className="text-xs text-red-400 hover:text-white flex items-center gap-1 font-semibold"
              >
                {copiedCode ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[11px] overflow-x-auto max-h-40 custom-scrollbar">
              {cronCodeSnippet}
            </pre>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-colors"
          >
            Save Schedule Settings
          </button>
        </div>

      </div>
    </div>
  );
};
