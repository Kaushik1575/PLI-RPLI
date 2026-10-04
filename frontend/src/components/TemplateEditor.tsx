import React, { useState } from 'react';
import { FileText, Sparkles, Check, RefreshCw, Eye, Tag, ShieldCheck } from 'lucide-react';
import { EmailTemplate, AgentProfile, Client } from '../types';
import { generateBirthdayEmailHtml } from '../utils/emailGenerator';

interface TemplateEditorProps {
  templates: EmailTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (id: string) => void;
  onUpdateTemplate: (template: EmailTemplate) => void;
  onResetTemplates: () => void;
  agent: AgentProfile;
  sampleClient: Client;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onUpdateTemplate,
  onResetTemplates,
  agent,
  sampleClient,
}) => {
  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const [formData, setFormData] = useState<EmailTemplate>(currentTemplate);
  const [savedNotice, setSavedNotice] = useState(false);

  // Sync if selection changes
  React.useEffect(() => {
    const t = templates.find(tmpl => tmpl.id === selectedTemplateId);
    if (t) setFormData(t);
  }, [selectedTemplateId, templates]);

  const handleFieldChange = (field: keyof EmailTemplate, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
  };

  const handleSave = () => {
    onUpdateTemplate(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const insertTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      message_body: prev.message_body + ` ${tag} `
    }));
  };

  const { subject, html } = generateBirthdayEmailHtml(sampleClient, agent, formData);

  const availableTags = [
    { tag: '{client_name}', desc: "Client's Name" },
    { tag: '{policy_no}', desc: 'Policy Number' },
    { tag: '{policy_type}', desc: 'Scheme Name' },
    { tag: '{agent_name}', desc: 'Agent Name' },
    { tag: '{agent_phone}', desc: 'Agent Phone' },
    { tag: '{branch}', desc: 'Post Office' },
    { tag: '{age}', desc: 'Age Turning' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-500" />
            Birthday Email Templates & Message Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Customize official Postal Life Insurance birthday emails with personalized tokens and theme styling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedNotice && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
          <button
            onClick={onResetTemplates}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Save Template</span>
          </button>
        </div>
      </div>

      {/* Theme Cards Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {templates.map((tpl) => {
          const isSelected = tpl.id === selectedTemplateId;
          return (
            <div
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 border-red-500 shadow-lg shadow-red-950/50 ring-2 ring-red-500/30'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">{tpl.name}</span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{tpl.subject}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {tpl.theme.replace('_', ' ')}
                </span>
                {isSelected && (
                  <span className="text-[10px] font-bold text-amber-400">Active Template</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-side Editor & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left: Template Fields Editor */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Template Content & Variables
            </h3>
            <span className="text-xs text-slate-400 font-mono">ID: {formData.id}</span>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Subject Line
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleFieldChange('subject', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Greeting Heading */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Banner Greeting Headline
            </label>
            <input
              type="text"
              value={formData.greeting_heading}
              onChange={(e) => handleFieldChange('greeting_heading', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Variable Insertion Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3 text-red-400" />
              Click to Insert Variable Tag into Message:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map(({ tag, desc }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertTag(tag)}
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono font-semibold border border-slate-700/80 transition-colors"
                  title={desc}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Message Body */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Greeting Message Body (Supports Paragraphs)
            </label>
            <textarea
              rows={8}
              value={formData.message_body}
              onChange={(e) => handleFieldChange('message_body', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white leading-relaxed focus:outline-none focus:border-red-500 font-sans"
            />
          </div>

          {/* Checkbox Options */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.include_policy_summary}
                onChange={(e) => handleFieldChange('include_policy_summary', e.target.checked)}
                className="w-4 h-4 rounded text-red-600 bg-slate-950 border-slate-700 focus:ring-red-500"
              />
              <span className="text-xs text-slate-300 font-medium">
                Include Protected Policy Details Card (Policy No, Scheme, Branch)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.include_premium_reminder_blurb}
                onChange={(e) => handleFieldChange('include_premium_reminder_blurb', e.target.checked)}
                className="w-4 h-4 rounded text-red-600 bg-slate-950 border-slate-700 focus:ring-red-500"
              />
              <span className="text-xs text-slate-300 font-medium">
                Include gentle Postal Life Insurance bonus & protection reassurance
              </span>
            </label>
          </div>

          {/* Footer Subtext */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Custom Footer Note / Valediction
            </label>
            <input
              type="text"
              value={formData.footer_text}
              onChange={(e) => handleFieldChange('footer_text', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

        </div>

        {/* Right: Real-time Live Preview */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              Real-time Email Preview (HTML)
            </h3>
            <span className="text-xs text-slate-400">
              Sample Recipient: {sampleClient.name}
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-inner overflow-hidden border border-slate-700/60">
            <iframe
              title="Live Template Preview"
              srcDoc={html}
              className="w-full h-[580px] border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

      </div>

    </div>
  );
};
