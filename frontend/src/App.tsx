import React, { useState, useEffect } from 'react';
import { PostalAgentMainView } from './components/PostalAgentMainView';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import confetti from 'canvas-confetti';

import { 
  Client, 
  AgentProfile, 
  EmailTemplate, 
  EmailLog, 
  ResendSettings, 
  SupabaseSettings 
} from './types';

import { 
  INITIAL_CLIENTS, 
  INITIAL_AGENT_PROFILE, 
  INITIAL_TEMPLATES, 
  INITIAL_LOGS 
} from './utils/mockData';

import { isBirthdayToday } from './utils/dateUtils';
import { sendBirthdayEmail } from './services/resendService';
import { 
  fetchPolicyholdersFromSupabase, 
  insertPolicyholderToSupabase, 
  updateBirthdayWishSentInSupabase, 
  updatePolicyholderInSupabase,
  deletePolicyholderFromSupabase,
  cleanSupabaseUrl
} from './services/supabaseService';

export const App: React.FC = () => {
  // Persistent State (strictly real policyholders, filtering out any legacy mock data)
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('dakpost_clients_v2');
    if (saved) {
      try {
        const parsed: Client[] = JSON.parse(saved);
        // Clean out only obsolete hardcoded mock IDs (1 to 8), preserve all real policyholders
        const obsoleteMockIds = new Set(['cli-1', 'cli-2', 'cli-3', 'cli-4', 'cli-5', 'cli-6', 'cli-7', 'cli-8']);
        return parsed.filter(c => !obsoleteMockIds.has(c.id));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [agent, setAgent] = useState<AgentProfile>(() => {
    const saved = localStorage.getItem('dakpost_agent');
    return saved ? JSON.parse(saved) : INITIAL_AGENT_PROFILE;
  });

  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    const saved = localStorage.getItem('dakpost_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [logs, setLogs] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem('dakpost_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const DEFAULT_SUPABASE_URL = 'https://qcbbhyxtacpxpnyjqygj.supabase.co';
  const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYmJoeXh0YWNweHBueWpxeWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5MjAyODksImV4cCI6MjEwNjQ5NjI4OX0.d8f_UjpJiiXrjAGSH1-0qJpc6yu03oZ0tgR_-0ct6PU';

  const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const envSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  const envResendKey = import.meta.env.VITE_RESEND_API_KEY || '';

  const [resendConfig, setResendConfig] = useState<ResendSettings>(() => {
    const saved = localStorage.getItem('dakpost_resend');
    const parsed = saved ? JSON.parse(saved) : null;
    const key = envResendKey || parsed?.api_key || '';
    return {
      api_key: key,
      sender_name: parsed?.sender_name || 'Postal Life Insurance Agent',
      sender_email: parsed?.sender_email || 'onboarding@resend.dev',
      is_connected: Boolean(key),
      simulation_mode: key ? false : (parsed?.simulation_mode ?? true),
    };
  });

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseSettings>(() => {
    const saved = localStorage.getItem('dakpost_supabase');
    const parsed = saved ? JSON.parse(saved) : null;
    const rawUrl = (parsed?.url && parsed.url.trim() !== '') ? parsed.url : envSupabaseUrl;
    const url = cleanSupabaseUrl(rawUrl) || cleanSupabaseUrl(envSupabaseUrl);
    const key = (parsed?.anon_key && parsed.anon_key.trim() !== '') ? parsed.anon_key.trim() : envSupabaseKey.trim();

    // Auto-heal localStorage if corrupted URL was saved earlier
    if (parsed && (parsed.url !== url || parsed.anon_key !== key)) {
      try {
        localStorage.setItem('dakpost_supabase', JSON.stringify({
          url: url,
          anon_key: key,
          is_connected: Boolean(url && key)
        }));
      } catch (e) {
        // ignore localStorage access issues
      }
    }

    return {
      url: url,
      anon_key: key,
      is_connected: Boolean(url && key),
    };
  });

  // UI Modals
  const [previewClient, setPreviewClient] = useState<Client | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Two-way sync: fetches all policyholders from Supabase and automatically pushes any local-only clients to Supabase
  useEffect(() => {
    if (supabaseConfig.is_connected && supabaseConfig.url && supabaseConfig.anon_key) {
      fetchPolicyholdersFromSupabase(supabaseConfig.url, supabaseConfig.anon_key).then(async (serverData) => {
        if (serverData) {
          // Detect any clients stored locally that are not yet in Supabase
          const serverPolicyNos = new Set(serverData.map(c => c.policy_number.toUpperCase()));
          const localOnly = clients.filter(c => !serverPolicyNos.has(c.policy_number.toUpperCase()));

          if (localOnly.length > 0) {
            console.log(`Auto-uploading ${localOnly.length} local-only policyholders to Supabase...`);
            for (const localClient of localOnly) {
              await insertPolicyholderToSupabase(supabaseConfig.url, supabaseConfig.anon_key, localClient);
            }
            const refreshed = await fetchPolicyholdersFromSupabase(supabaseConfig.url, supabaseConfig.anon_key);
            setClients(refreshed);
            localStorage.setItem('dakpost_clients_v2', JSON.stringify(refreshed));
          } else {
            setClients(serverData);
            localStorage.setItem('dakpost_clients_v2', JSON.stringify(serverData));
          }
        }
      });
    }
  }, [supabaseConfig.is_connected, supabaseConfig.url, supabaseConfig.anon_key]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dakpost_clients_v2', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('dakpost_agent', JSON.stringify(agent));
  }, [agent]);

  useEffect(() => {
    localStorage.setItem('dakpost_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('dakpost_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('dakpost_resend', JSON.stringify(resendConfig));
  }, [resendConfig]);

  useEffect(() => {
    localStorage.setItem('dakpost_supabase', JSON.stringify(supabaseConfig));
  }, [supabaseConfig]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const activeTemplate = templates[0] || INITIAL_TEMPLATES[0];

  // Add new policyholder
  const handleAddClient = async (clientData: Omit<Client, 'id' | 'created_at'>) => {
    let createdId = `cli-${Date.now()}`;

    // Push to Supabase policyholders table if connected
    if (supabaseConfig.is_connected && supabaseConfig.url && supabaseConfig.anon_key) {
      const res = await insertPolicyholderToSupabase(supabaseConfig.url, supabaseConfig.anon_key, clientData);
      if (res.error) {
        showToast(`Database error: ${res.error}`, 'error');
        return;
      }
      if (res.id) createdId = res.id;
    }

    const newClient: Client = {
      ...clientData,
      id: createdId,
      created_at: new Date().toISOString(),
    };
    setClients(prev => [newClient, ...prev]);

    showToast(`Added ${newClient.name} (${newClient.policy_number}) to Policy list!`, 'success');
  };

  // Update existing policyholder
  const handleUpdateClient = async (updatedClient: Client) => {
    setClients(prev => {
      const updated = prev.map(c => c.id === updatedClient.id ? updatedClient : c);
      localStorage.setItem('dakpost_clients_v2', JSON.stringify(updated));
      return updated;
    });

    if (supabaseConfig.is_connected && supabaseConfig.url && supabaseConfig.anon_key) {
      const res = await updatePolicyholderInSupabase(supabaseConfig.url, supabaseConfig.anon_key, updatedClient);
      if (res.error) {
        showToast(`Database update warning: ${res.error}`, 'error');
      }
    }

    showToast(`Updated policyholder details for ${updatedClient.name}!`, 'success');
  };

  // Delete policyholder
  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));

    // Remove from Supabase if connected
    if (supabaseConfig.is_connected && supabaseConfig.url && supabaseConfig.anon_key) {
      deletePolicyholderFromSupabase(supabaseConfig.url, supabaseConfig.anon_key, id);
    }

    showToast('Policyholder removed from list', 'info');
  };

  // Send single birthday email
  const handleSendSingleEmail = async (client: Client) => {
    try {
      const res = await sendBirthdayEmail(client, agent, activeTemplate, resendConfig);
      
      const newLog: EmailLog = {
        id: `log-${Date.now()}`,
        client_id: client.id,
        client_name: client.name,
        client_email: client.email,
        policy_number: client.policy_number,
        policy_type: client.policy_type,
        sent_at: new Date().toISOString(),
        status: res.success ? (res.simulated ? 'simulated' : 'sent') : 'failed',
        subject: activeTemplate.subject.replace('{client_name}', client.name),
        template_id: activeTemplate.id,
        resend_id: res.resendId,
        error_message: res.error,
      };

      setLogs(prev => [newLog, ...prev]);

      // Update last_birthday_wish_sent in Supabase if connected
      if (supabaseConfig.is_connected && supabaseConfig.url && supabaseConfig.anon_key) {
        updateBirthdayWishSentInSupabase(supabaseConfig.url, supabaseConfig.anon_key, client.id);
      }

      if (res.success) {
        showToast(
          res.simulated
            ? `[Simulation] Birthday mail sent to ${client.name} (${client.email})!`
            : `Birthday greeting email dispatched via Resend to ${client.name}!`,
          'success'
        );
      } else {
        showToast(`Failed to send email: ${res.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error sending email: ${err.message}`, 'error');
    }
  };

  // Send all today's birthday greetings
  const handleSendAllToday = async () => {
    const todayBirthdays = clients.filter(c => isBirthdayToday(c.date_of_birth));
    if (todayBirthdays.length === 0) {
      showToast('No policyholders have a birthday today.', 'info');
      return;
    }

    setIsSendingBulk(true);
    let successCount = 0;

    for (const client of todayBirthdays) {
      try {
        const res = await sendBirthdayEmail(client, agent, activeTemplate, resendConfig);
        const newLog: EmailLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          client_id: client.id,
          client_name: client.name,
          client_email: client.email,
          policy_number: client.policy_number,
          policy_type: client.policy_type,
          sent_at: new Date().toISOString(),
          status: res.success ? (res.simulated ? 'simulated' : 'sent') : 'failed',
          subject: activeTemplate.subject.replace('{client_name}', client.name),
          template_id: activeTemplate.id,
          resend_id: res.resendId,
          error_message: res.error,
        };
        setLogs(prev => [newLog, ...prev]);

        if (supabaseConfig.is_connected && supabaseConfig.url && supabaseConfig.anon_key) {
          updateBirthdayWishSentInSupabase(supabaseConfig.url, supabaseConfig.anon_key, client.id);
        }

        if (res.success) successCount++;
      } catch (err) {
        console.error('Error sending email:', err);
      }
    }

    setIsSendingBulk(false);
    try {
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    showToast(
      `Dispatched birthday greetings to ${successCount} policyholder${successCount > 1 ? 's' : ''}!`,
      'success'
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Toast Notification (Top-centered floating pill: prominent, elevated above modals, never blocked by bottom nav) */}
      {toastMessage && (
        <div className="fixed top-5 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`pointer-events-auto px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold flex items-center gap-3 max-w-md w-full sm:w-auto backdrop-blur-md transition-all ${
            toastMessage.type === 'success'
              ? 'bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/40 ring-1 ring-emerald-500/20'
              : toastMessage.type === 'error'
                ? 'bg-red-950/95 text-white border-red-500/50 shadow-red-950/40 ring-1 ring-red-500/20'
                : 'bg-slate-900/95 text-white border-slate-700/60 shadow-slate-950/40'
          }`}>
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 bg-white/10">
              {toastMessage.type === 'success' ? '🎂' : toastMessage.type === 'error' ? '⚠️' : 'ℹ️'}
            </span>
            <span className="flex-1 text-xs sm:text-sm font-semibold leading-snug">{toastMessage.text}</span>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-white/60 hover:text-white p-1 rounded-lg transition-colors text-xs font-bold shrink-0"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Father-Friendly View */}
      <PostalAgentMainView
        clients={clients}
        agent={agent}
        templates={templates}
        logs={logs}
        onAddClient={handleAddClient}
        onUpdateClient={handleUpdateClient}
        onDeleteClient={handleDeleteClient}
        onSendSingleEmail={handleSendSingleEmail}
        onSendAllToday={handleSendAllToday}
        onPreviewClientEmail={(c) => setPreviewClient(c)}
        onShowToast={showToast}
        isSendingBulk={isSendingBulk}
      />

      {/* Email Preview Modal */}
      <EmailPreviewModal
        isOpen={Boolean(previewClient)}
        onClose={() => setPreviewClient(null)}
        client={previewClient}
        agent={agent}
        template={activeTemplate}
        onSendEmail={handleSendSingleEmail}
        isSending={false}
      />

      {/* Simple Footer with clearance for mobile bottom bar */}
      <footer className="border-t border-slate-200 bg-white py-4 pb-24 md:pb-4 text-xs text-slate-500 text-center px-4">
        Postal Life Insurance (PLI) & Rural PLI (RPLI) • Birthday Notification Dispatcher • India Post
      </footer>

    </div>
  );
};

export default App;
