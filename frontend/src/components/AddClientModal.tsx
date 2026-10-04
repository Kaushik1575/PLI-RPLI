import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Calendar, Shield, IndianRupee, MapPin, FileText } from 'lucide-react';
import { Client } from '../types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Omit<Client, 'id' | 'created_at'> & { id?: string }) => void;
  editingClient?: Client | null;
}

const POLICY_SCHEMES = [
  'Santosh (Endowment Assurance)',
  'Suraksha (Whole Life Assurance)',
  'Suvidha (Convertible Whole Life)',
  'Sumangal (Anticipated Endowment)',
  'Yugal Suraksha (Joint Life Assurance)',
  'Bal Jeevan Bima (Children Policy)',
  'Gram Santosh (Rural Endowment Assurance)',
  'Gram Suraksha (Rural Whole Life)',
  'Gram Suvidha (Rural Convertible)',
  'Gram Sumangal (Rural Anticipated)',
  'Gram Priya (10 Year Rural PLI)',
];

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingClient,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '1990-01-01',
    policy_number: '',
    policy_type: POLICY_SCHEMES[0],
    policy_category: 'PLI' as Client['policy_category'],
    policy_opening_date: '2023-01-01',
  });

  useEffect(() => {
    if (editingClient) {
      setFormData({
        name: editingClient.name,
        email: editingClient.email,
        phone: editingClient.phone,
        date_of_birth: editingClient.date_of_birth,
        policy_number: editingClient.policy_number,
        policy_category: editingClient.policy_category || 'PLI',
        policy_type: editingClient.policy_type,
        policy_opening_date: editingClient.policy_opening_date || '2023-01-01',
      });
    } else {
      // Default new policyholder
      const today = new Date();
      const monthStr = String(today.getMonth() + 1).padStart(2, '0');
      const dayStr = String(today.getDate()).padStart(2, '0');
      setFormData({
        name: '',
        email: '',
        phone: '+91 ',
        date_of_birth: `1992-${monthStr}-${dayStr}`, // Default to today's month/day for easy testing
        policy_number: `PLI-WB-2024-${Math.floor(100000 + Math.random() * 900000)}`,
        policy_category: 'PLI',
        policy_type: POLICY_SCHEMES[0],
        policy_opening_date: today.toISOString().split('T')[0],
      });
    }
  }, [editingClient, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.date_of_birth) {
      alert('Please fill in the client name, email, and date of birth.');
      return;
    }

    onSave({
      ...formData,
      id: editingClient ? editingClient.id : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {editingClient ? 'Edit Policyholder Information' : 'Add New Policyholder (PLI / RPLI)'}
              </h3>
              <p className="text-xs text-slate-400">
                Registered policyholder details for birthday automation and relationship records.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Row 1: Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-400" />
                Policyholder Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Smt. Gayatri Devi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                Email Address (For Birthday Mails) *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. client@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Row 2: Phone & Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Mobile / WhatsApp Number
              </label>
              <input
                type="text"
                placeholder="+91 98300 XXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                Date of Birth (DOB) *
              </label>
              <input
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Row 3: Policy Number & Scheme Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Policy Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PLI-WB-2021-987410"
                value={formData.policy_number}
                onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Policy Scheme / Plan
              </label>
              <select
                value={formData.policy_type}
                onChange={(e) => setFormData({ ...formData, policy_type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
              >
                {POLICY_SCHEMES.map(scheme => (
                  <option key={scheme} value={scheme}>{scheme}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Policy Opening Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Policy Opening Date (Date of Commencement) *
            </label>
            <input
              type="date"
              required
              value={formData.policy_opening_date}
              onChange={(e) => setFormData({ ...formData, policy_opening_date: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{editingClient ? 'Update Policyholder' : 'Save Policyholder'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
