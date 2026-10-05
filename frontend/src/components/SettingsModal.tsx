import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Mail, 
  Database, 
  Send, 
  Check, 
  ShieldCheck, 
  Key, 
  Copy, 
  CheckCheck, 
  X,
  ExternalLink
} from 'lucide-react';
import { AgentProfile, ResendSettings, SupabaseSettings } from '../types';
import { sendTestEmail } from '../services/resendService';
import { testSupabaseConnection, SUPABASE_SQL_SCHEMA } from '../services/supabaseService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentProfile;
  onUpdateAgent: (agent: AgentProfile) => void;
  resendConfig: ResendSettings;
  onUpdateResendConfig: (config: ResendSettings) => void;
  supabaseConfig: SupabaseSettings;
  onUpdateSupabaseConfig: (config: SupabaseSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  agent,
  onUpdateAgent,
  resendConfig,
  onUpdateResendConfig,
  supabaseConfig,
  onUpdateSupabaseConfig,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'agent' | 'resend' | 'supabase'>('agent');
  
  // Agent profile state
  const [agentForm, setAgentForm] = useState<AgentProfile>(agent);
  const [agentSaved, setAgentSaved] = useState(false);

  // Resend state
  const [resendForm, setResendForm] = useState<ResendSettings>(resendConfig);
  const [testEmailRecipient, setTestEmailRecipient] = useState(agent.email || '');
  const [testEmailStatus, setTestEmailStatus] = useState<{ loading: boolean; message: string; success?: boolean } | null>(null);

  // Supabase state
  const [supabaseForm, setSupabaseForm] = useState<SupabaseSettings>(supabaseConfig);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{ loading: boolean; message: string; success?: boolean } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSaveAgent = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAgent(agentForm);
    setAgentSaved(true);
    setTimeout(() => setAgentSaved(false), 3000);
  };

  const handleSaveResend = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateResendConfig(resendForm);
    alert('Resend settings updated successfully!');
  };

  const handleSendTestResendEmail = async () => {
    if (!testEmailRecipient) {
      alert('Please enter a recipient email address to send the test verification email.');
      return;
    }
    setTestEmailStatus({ loading: true, message: 'Sending test email via Resend...' });
    const result = await sendTestEmail(testEmailRecipient, agentForm, resendForm);
    if (result.success) {
      setTestEmailStatus({
        loading: false,
        success: true,
        message: result.simulated
          ? 'Simulation mode successful! (Simulated Resend ID: ' + result.resendId + ')'
          : 'Verification email sent via Resend! Check your inbox (' + testEmailRecipient + '). ID: ' + result.resendId,
      });
    } else {
      setTestEmailStatus({
        loading: false,
        success: false,
        message: result.error || 'Failed to send test email',
      });
    }
  };

  const handleTestSupabase = async () => {
    if (!supabaseForm.url || !supabaseForm.anon_key) {
      alert('Please enter both Supabase Project URL and Anon Public Key.');
      return;
    }
    setSupabaseTestStatus({ loading: true, message: 'Verifying Supabase connection...' });
    const result = await testSupabaseConnection(supabaseForm.url, supabaseForm.anon_key);
    setSupabaseTestStatus({
      loading: false,
      success: result.success,
      message: result.message,
    });
    if (result.success) {
      onUpdateSupabaseConfig({
        ...supabaseForm,
        is_connected: true,
      });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Settings & Agency Profile</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Configure Postal Agency details, Resend API, & Supabase DB.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 active:bg-slate-200 transition-colors touch-target"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Tabs: horizontally scrollable on mobile */}
        <div className="px-4 sm:px-6 pt-2 sm:pt-4 border-b border-slate-200 flex items-center gap-1 sm:gap-2 bg-white overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('agent')}
            className={`pb-2.5 sm:pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap touch-target ${
              activeSubTab === 'agent'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Agent Profile</span>
          </button>

          <button
            onClick={() => setActiveSubTab('resend')}
            className={`pb-2.5 sm:pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap touch-target ${
              activeSubTab === 'resend'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Resend Email API</span>
            {resendConfig.api_key && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
          </button>

          <button
            onClick={() => setActiveSubTab('supabase')}
            className={`pb-2.5 sm:pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap touch-target ${
              activeSubTab === 'supabase'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Cloud DB</span>
            {supabaseConfig.is_connected && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* SubTab 1: Agent Details */}
          {activeSubTab === 'agent' && (
            <form onSubmit={handleSaveAgent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Agent Name(s) *
                  </label>
                  <input
                    type="text"
                    required
                    value={agentForm.agent_name}
                    onChange={(e) => setAgentForm({ ...agentForm, agent_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Agency Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={agentForm.agency_code}
                    onChange={(e) => setAgentForm({ ...agentForm, agency_code: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={agentForm.agent_role}
                    onChange={(e) => setAgentForm({ ...agentForm, agent_role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Attached Head Post Office
                  </label>
                  <input
                    type="text"
                    value={agentForm.post_office}
                    onChange={(e) => setAgentForm({ ...agentForm, post_office: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile / WhatsApp Contact *
                  </label>
                  <input
                    type="text"
                    required
                    value={agentForm.phone}
                    onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Agent Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={agentForm.email}
                    onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                {agentSaved && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    Agent details updated!
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-200 transition-colors"
                >
                  Save Agent Profile
                </button>
              </div>
            </form>
          )}

          {/* SubTab 2: Resend Settings */}
          {activeSubTab === 'resend' && (
            <div className="space-y-5">
              <form onSubmit={handleSaveResend} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-amber-900">Sandbox / Simulation Mode</div>
                    <div className="text-xs text-amber-700">
                      When enabled, emails simulate realistic delivery without needing an API key upfront.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resendForm.simulation_mode}
                      onChange={(e) => setResendForm({ ...resendForm, simulation_mode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Resend API Key</span>
                    <a
                      href="https://resend.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-red-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Get Free API Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input
                    type="password"
                    placeholder="re_xxxxxxxxxxxx"
                    value={resendForm.api_key}
                    onChange={(e) => setResendForm({ ...resendForm, api_key: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      placeholder="Postal Agent"
                      value={resendForm.sender_name}
                      onChange={(e) => setResendForm({ ...resendForm, sender_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sender Email (Verified Domain)
                    </label>
                    <input
                      type="text"
                      placeholder="onboarding@jitus.tech"
                      value={resendForm.sender_email}
                      onChange={(e) => setResendForm({ ...resendForm, sender_email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl bg-slate-800 active:bg-slate-900 text-white font-bold text-sm sm:text-xs transition-colors touch-target"
                  >
                    Save Resend Config
                  </button>
                </div>
              </form>

              {/* Test Email */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Send Test Email to Verify</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Enter email to receive test message..."
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestResendEmail}
                    disabled={testEmailStatus?.loading}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 active:bg-red-700 text-white font-bold text-sm sm:text-xs touch-target"
                  >
                    {testEmailStatus?.loading ? 'Sending...' : 'Send Test'}
                  </button>
                </div>
                {testEmailStatus && (
                  <p className={`text-xs font-semibold ${testEmailStatus.success ? 'text-emerald-700' : 'text-red-600'}`}>
                    {testEmailStatus.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SubTab 3: Supabase Settings */}
          {activeSubTab === 'supabase' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyz.supabase.co"
                  value={supabaseForm.url}
                  onChange={(e) => setSupabaseForm({ ...supabaseForm, url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Anon Public API Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                  value={supabaseForm.anon_key}
                  onChange={(e) => setSupabaseForm({ ...supabaseForm, anon_key: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={supabaseTestStatus?.loading}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 active:bg-slate-900 text-white font-bold text-sm sm:text-xs touch-target text-center"
                >
                  {supabaseTestStatus?.loading ? 'Testing...' : 'Test Connection'}
                </button>

                <button
                  type="button"
                  onClick={handleCopySql}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 active:bg-red-100 text-red-700 border border-red-200 text-sm sm:text-xs font-bold touch-target"
                >
                  {copiedSql ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              {supabaseTestStatus && (
                <p className={`text-xs font-semibold ${supabaseTestStatus.success ? 'text-emerald-700' : 'text-red-600'}`}>
                  {supabaseTestStatus.message}
                </p>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-sm sm:text-xs transition-colors touch-target"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
