import React, { useState } from 'react';
import { X, Send, Smartphone, Monitor, RefreshCw, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { Client, AgentProfile, EmailTemplate } from '../types';
import { generateBirthdayEmailHtml } from '../utils/emailGenerator';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  agent: AgentProfile;
  template: EmailTemplate;
  onSendEmail: (client: Client) => Promise<void>;
  isSending: boolean;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  client,
  agent,
  template,
  onSendEmail,
  isSending,
}) => {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen || !client) return null;

  const { subject, html } = generateBirthdayEmailHtml(client, agent, template);

  const handleSend = async () => {
    await onSendEmail(client);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="/POSTOFFICELOGO.jpg" 
              alt="India Post" 
              className="w-8 h-8 rounded-lg object-contain border border-red-200 bg-red-600"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Email Preview: Birthday Greeting for {client.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                To: {client.email} • Policy: {client.policy_number}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport switch */}
            <div className="bg-slate-200 p-0.5 rounded-lg flex items-center border border-slate-300">
              <button
                onClick={() => setDeviceView('desktop')}
                className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors ${
                  deviceView === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors ${
                  deviceView === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Email Meta Headers Info */}
        <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 w-16">Subject:</span>
            <span className="font-medium text-red-700 truncate">{subject}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 w-16">Sender:</span>
            <span className="text-slate-700">{agent.agent_name} &lt;{agent.email}&gt; (via Resend)</span>
          </div>
        </div>

        {/* Rendered Email Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex justify-center custom-scrollbar">
          <div
            className={`transition-all duration-300 bg-white rounded-xl shadow-lg border border-slate-300 overflow-hidden ${
              deviceView === 'mobile' ? 'w-[375px]' : 'w-full max-w-[620px]'
            }`}
          >
            <iframe
              title="Birthday Email Preview"
              srcDoc={html}
              className="w-full h-[550px] border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Postal Life Insurance greeting template</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-3 sm:py-2.5 rounded-xl bg-slate-200 active:bg-slate-300 text-slate-700 text-sm sm:text-xs font-bold transition-colors touch-target text-center"
            >
              Close
            </button>

            <button
              onClick={handleSend}
              disabled={isSending || sentSuccess}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-red-600 active:bg-red-700 text-white text-sm sm:text-xs font-bold shadow-md shadow-red-200 transition-all disabled:opacity-50 touch-target"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : sentSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Dispatched!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Wish Now</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
