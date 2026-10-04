import React, { useState, useRef } from 'react';
import { 
  UserPlus, 
  Send, 
  Cake, 
  Calendar, 
  Mail, 
  Phone, 
  Shield, 
  Search, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Settings,
  Menu,
  X,
  UserCheck,
  ChevronRight,
  Sparkles,
  Info,
  Copy,
  Check,
  List,
  PlusCircle,
  Smartphone,
  Edit,
  Save,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Client, AgentProfile, EmailTemplate, EmailLog } from '../types';
import { isBirthdayToday, getDaysUntilBirthday, calculateAge, formatFriendlyDate } from '../utils/dateUtils';

interface PostalAgentMainViewProps {
  clients: Client[];
  agent: AgentProfile;
  templates: EmailTemplate[];
  logs: EmailLog[];
  onAddClient: (newClient: Omit<Client, 'id' | 'created_at'>) => void;
  onUpdateClient: (updatedClient: Client) => void;
  onDeleteClient: (id: string) => void;
  onSendSingleEmail: (client: Client) => Promise<void>;
  onSendAllToday: () => Promise<void>;
  onPreviewClientEmail: (client: Client) => void;
  onOpenSettings?: () => void;
  onShowToast?: (text: string, type?: 'success' | 'error' | 'info') => void;
  isSendingBulk: boolean;
}

const PLI_SCHEMES = [
  'Santosh (Endowment Assurance)',
  'Suraksha (Whole Life Assurance)',
  'Suvidha (Convertible Whole Life)',
  'Sumangal (Anticipated Endowment)',
  'Yugal Suraksha (Joint Life)',
  'Bal Jeevan Bima (Children Policy)',
];

const RPLI_SCHEMES = [
  'Gram Santosh (Rural Endowment)',
  'Gram Suraksha (Rural Whole Life)',
  'Gram Suvidha (Rural Convertible Whole Life)',
  'Gram Sumangal (Rural Anticipated Endowment)',
  'Gram Priya (10 Year Rural RPLI)',
];

// Official Indian National Flag SVG Component (Tiranga with Ashoka Chakra)
export const IndianFlag: React.FC<{ className?: string }> = ({ className = 'w-7 h-4.5' }) => (
  <svg
    viewBox="0 0 900 600"
    className={`${className} rounded-[3px] shadow-xs border border-slate-200/60 shrink-0 inline-block align-middle overflow-hidden`}
    aria-label="National Flag of India"
  >
    {/* Saffron Band */}
    <rect width="900" height="200" fill="#FF9933" />
    {/* White Band */}
    <rect y="200" width="900" height="200" fill="#FFFFFF" />
    {/* Green Band */}
    <rect y="400" width="900" height="200" fill="#138808" />
    {/* Navy Blue Ashoka Chakra Ring */}
    <circle cx="450" cy="300" r="76" fill="none" stroke="#000080" strokeWidth="12" />
    {/* Central Hub */}
    <circle cx="450" cy="300" r="16" fill="#000080" />
    {/* 24 Spokes */}
    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 15 * Math.PI) / 180;
      return (
        <line
          key={i}
          x1="450"
          y1="300"
          x2={450 + 76 * Math.cos(angle)}
          y2={300 + 76 * Math.sin(angle)}
          stroke="#000080"
          strokeWidth="5"
        />
      );
    })}
  </svg>
);

export const PostalAgentMainView: React.FC<PostalAgentMainViewProps> = ({
  clients,
  agent,
  templates,
  logs,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onSendSingleEmail,
  onSendAllToday,
  onPreviewClientEmail,
  onOpenSettings,
  onShowToast,
  isSendingBulk,
}) => {
  // Navigation / Page State: Add Policyholder opens by default when website loads
  const [activeTab, setActiveTab] = useState<'add' | 'today' | 'directory'>('add');

  // Form State for Adding Policyholder
  const [name, setName] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [policyCategory, setPolicyCategory] = useState<'PLI' | 'RPLI'>('PLI');
  const [policyScheme, setPolicyScheme] = useState(PLI_SCHEMES[0]);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [policyOpeningDate, setPolicyOpeningDate] = useState('');
  const [phone, setPhone] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Edit Policyholder State
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editName, setEditName] = useState('');
  const [editPolicyNumber, setEditPolicyNumber] = useState('');
  const [editCategory, setEditCategory] = useState<'PLI' | 'RPLI'>('PLI');
  const [editScheme, setEditScheme] = useState(PLI_SCHEMES[0]);
  const [editDOB, setEditDOB] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editOpeningDate, setEditOpeningDate] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editError, setEditError] = useState('');

  // Hamburger Menu & Inspection Drawer State
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [inspectingClient, setInspectingClient] = useState<Client | null>(null);
  const [copiedPolicyNo, setCopiedPolicyNo] = useState(false);
  const [isSubmittingPolicy, setIsSubmittingPolicy] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'pli' | 'rpli'>('all');
  const [sendingClientId, setSendingClientId] = useState<string | null>(null);

  // Switch policy schemes when category changes
  const handleCategoryChange = (category: 'PLI' | 'RPLI') => {
    setPolicyCategory(category);
    if (category === 'PLI') {
      setPolicyScheme(PLI_SCHEMES[0]);
    } else {
      setPolicyScheme(RPLI_SCHEMES[0]);
    }
  };

  const handleEditCategoryChange = (category: 'PLI' | 'RPLI') => {
    setEditCategory(category);
    if (category === 'PLI') {
      setEditScheme(PLI_SCHEMES[0]);
    } else {
      setEditScheme(RPLI_SCHEMES[0]);
    }
  };

  // Open Edit Modal
  const startEditing = (client: Client) => {
    setEditingClient(client);
    setEditName(client.name);
    setEditPolicyNumber(client.policy_number);
    const cat = client.policy_category || (client.policy_number.startsWith('RPLI') ? 'RPLI' : 'PLI');
    setEditCategory(cat);
    setEditScheme(client.policy_type);
    setEditDOB(client.date_of_birth);
    setEditEmail(client.email);
    setEditOpeningDate(client.policy_opening_date || '');
    setEditPhone(client.phone || '');
  };

  // Save Edited Client
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    setEditError('');

    if (!editName.trim() || !editPolicyNumber.trim() || !editDOB || !editEmail.trim()) {
      setEditError('Please fill mandatory fields: Policyholder Name, Policy Number, Date of Birth, and Customer Mail ID.');
      onShowToast?.('⚠️ Please fill all mandatory fields (*)', 'error');
      return;
    }

    setIsSavingEdit(true);
    try {
      const updated: Client = {
        ...editingClient,
        name: editName.trim(),
        policy_number: editPolicyNumber.trim().toUpperCase(),
        policy_category: editCategory,
        policy_type: editScheme,
        date_of_birth: editDOB,
        email: editEmail.trim(),
        policy_opening_date: editOpeningDate || '',
        phone: editPhone.trim() || '+91 ',
      };

      await onUpdateClient(updated);
      setEditingClient(null);
      setEditError('');
      onShowToast?.(`✅ Policy details updated for ${updated.name}!`, 'success');

      // If inspecting this client, update the modal inspection
      if (inspectingClient?.id === updated.id) {
        setInspectingClient(updated);
      }
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Form submit handler: stores ONLY form fields, no unnecessary data
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !policyNumber.trim() || !dateOfBirth || !email.trim()) {
      setFormError('Please fill mandatory fields: Policyholder Name, Policy Number, Date of Birth, and Customer Mail ID.');
      onShowToast?.('⚠️ Please fill all mandatory fields (*)', 'error');
      return;
    }

    setIsSubmittingPolicy(true);
    try {
      await onAddClient({
        name: name.trim(),
        policy_number: policyNumber.trim().toUpperCase(),
        policy_category: policyCategory,
        policy_type: policyScheme,
        date_of_birth: dateOfBirth,
        email: email.trim(),
        policy_opening_date: policyOpeningDate || new Date().toISOString().split('T')[0],
        phone: phone.trim() || '+91 ',
      });

      // Reset Form
      setName('');
      setPolicyNumber('');
      setDateOfBirth('');
      setEmail('');
      setPolicyOpeningDate('');
      setPhone('');
      setFormError('');
      setFormSuccess(true);
      onShowToast?.(`🎉 Policyholder ${name.trim()} added & synced to database!`, 'success');
      setTimeout(() => setFormSuccess(false), 5000);
    } finally {
      setIsSubmittingPolicy(false);
    }
  };

  // Check if sent today
  const hasSentToday = (clientId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const client = clients.find(c => c.id === clientId);
    if (client?.last_birthday_wish_sent && client.last_birthday_wish_sent.startsWith(todayStr)) {
      return true;
    }
    return logs.some(l => 
      l.client_id === clientId && 
      l.sent_at.startsWith(todayStr) && 
      l.status !== 'failed'
    );
  };

  const handleSendSingle = async (client: Client) => {
    setSendingClientId(client.id);
    try {
      await onSendSingleEmail(client);
    } finally {
      setSendingClientId(null);
    }
  };

  // Filter clients
  const todayBirthdays = clients.filter(c => isBirthdayToday(c.date_of_birth));
  
  // Upcoming birthdays (next 30 days, not today)
  const upcomingBirthdays = clients
    .filter(c => !isBirthdayToday(c.date_of_birth))
    .sort((a, b) => getDaysUntilBirthday(a.date_of_birth) - getDaysUntilBirthday(b.date_of_birth))
    .slice(0, 5);

  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase();
    const matches = 
      client.name.toLowerCase().includes(term) ||
      client.policy_number.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.policy_type.toLowerCase().includes(term);

    if (!matches) return false;

    if (categoryFilter === 'pli') return client.policy_category === 'PLI' || client.policy_number.startsWith('PLI');
    if (categoryFilter === 'rpli') return client.policy_category === 'RPLI' || client.policy_number.startsWith('RPLI');
    return true;
  });

  const handleCopyPolicy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPolicyNo(true);
    onShowToast?.(`📋 Policy Number ${text} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedPolicyNo(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-28 md:pb-16 font-sans relative">
      
      {/* 1. TOP POSTAL HEADER WITH TRICOLOR RIBBON & LIVE AUTOMATION STATUS */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        
        {/* Official Indian National Tricolor Ribbon */}
        <div className="h-2 w-full flex shadow-xs border-b border-slate-200">
          <div className="flex-1 bg-[#FF9933]"></div>
          <div className="flex-1 bg-white border-x border-slate-200"></div>
          <div className="flex-1 bg-[#138808]"></div>
        </div>

        {/* Top Official Strip */}
        <div className="bg-[#b91c1c] text-white text-[10px] sm:text-[11px] font-semibold px-2.5 sm:px-6 py-1 sm:py-1.5 flex items-center justify-between shadow-xs overflow-hidden flex-nowrap">
          <div className="flex items-center gap-1.5 shrink-0 min-w-0">
            <span className="bg-amber-400 text-red-950 px-2 py-0.5 rounded font-black text-[9px] sm:text-[10px] tracking-wide uppercase shadow-xs flex items-center gap-1 shrink-0 whitespace-nowrap">
              <IndianFlag className="w-3.5 h-2.5 sm:w-4 sm:h-3 rounded-[2px]" />
              <span className="sm:hidden">डाक विभाग &bull; INDIA POST</span>
              <span className="hidden sm:inline">डाक विभाग &bull; DEPARTMENT OF POSTS</span>
            </span>
            <span className="hidden md:inline text-red-100 text-[11px] truncate">
              Government of India &bull; Postal Life Insurance
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-red-900/90 border border-red-700/60 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold text-amber-300 shrink-0 whitespace-nowrap">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="sm:hidden">6 AM Auto Active</span>
            <span className="hidden sm:inline">6:00 AM IST Auto-Dispatch Active</span>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Hamburger Button (Large touch target with label) */}
            <button
              onClick={() => setIsHamburgerOpen(!isHamburgerOpen)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 transition-colors focus:outline-none touch-target flex items-center gap-1.5 border border-slate-200 shrink-0"
              title="Open Navigation Menu"
              aria-label="Navigation Menu"
            >
              {isHamburgerOpen ? <X className="w-5 h-5 text-red-600" /> : <Menu className="w-5 h-5 text-slate-700" />}
              <span className="hidden sm:inline font-bold text-xs text-slate-700">Menu</span>
            </button>

            {/* Official India Post Logo */}
            <img 
              src="/india_post_thumb_960.png" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/POSTOFFICELOGO.jpg';
              }}
              alt="India Post Logo" 
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain shadow-xs border border-red-200 bg-white p-0.5 shrink-0"
            />

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-1">
                  DakPost <span className="text-red-600 font-extrabold">PLI</span>
                </h1>
                <IndianFlag className="w-4 h-3 sm:w-6 sm:h-4 inline-block" />
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold truncate max-w-[160px] xs:max-w-[200px] sm:max-w-none mt-0.5">
                {agent.agent_name} &bull; <span className="text-red-700 font-bold">PLI Agent</span>
              </p>
            </div>
          </div>

          {/* Quick Header Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop Full Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <span className="text-red-700">📁 Policies: {clients.length}</span>
              <span className="text-slate-300">|</span>
              <span className="text-amber-700">🎂 Today: {todayBirthdays.length}</span>
            </div>

            {/* Mobile Compact Badges (Never overlaps or spills off-screen) */}
            <div className="flex sm:hidden items-center gap-1.5">
              <button
                onClick={() => setActiveTab('today')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${
                  todayBirthdays.length > 0
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title="Today's Birthdays"
              >
                <span>🎂</span>
                <span className="font-extrabold">{todayBirthdays.length}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. SLIDE-OUT HAMBURGER MENU DRAWER */}
      {isHamburgerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex"
          onClick={(e) => { if (e.target === e.currentTarget) setIsHamburgerOpen(false); }}
        >
          <div className="w-80 max-w-[85vw] bg-white h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto border-r border-slate-200 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              
              {/* Drawer Top */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <img src="/POSTOFFICELOGO.jpg" alt="Logo" className="w-9 h-9 rounded-lg bg-white object-contain p-0.5 border border-red-100" />
                  <div>
                    <h3 className="font-black text-slate-900 text-base">DakPost Menu</h3>
                    <p className="text-[11px] text-slate-500">Postal Agent Portal</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsHamburgerOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 active:bg-slate-100 touch-target"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Options with Large Touch Targets */}
              <div className="space-y-2 text-sm font-bold text-slate-700">
                {/* 1. Add Policyholder */}
                <button
                  onClick={() => {
                    setActiveTab('add');
                    setIsHamburgerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-colors text-left border ${
                    activeTab === 'add'
                      ? 'bg-red-50 text-red-700 border-red-200 font-black'
                      : 'bg-slate-50 text-slate-700 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-5 h-5 text-red-600" />
                    <span>➕ Add Policyholder</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* 2. Today's Birthdays */}
                <button
                  onClick={() => {
                    setActiveTab('today');
                    setIsHamburgerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-colors text-left border ${
                    activeTab === 'today'
                      ? 'bg-red-50 text-red-700 border-red-200 font-black'
                      : 'bg-slate-50 text-slate-700 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Cake className="w-5 h-5 text-amber-500" />
                    <span>🎂 Today's Birthdays</span>
                  </div>
                  {todayBirthdays.length > 0 ? (
                    <span className="px-2.5 py-0.5 text-xs bg-red-600 text-white rounded-full font-black">
                      {todayBirthdays.length}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">0</span>
                  )}
                </button>

                {/* 3. All Policyholders */}
                <button
                  onClick={() => {
                    setActiveTab('directory');
                    setIsHamburgerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-colors text-left border ${
                    activeTab === 'directory'
                      ? 'bg-red-50 text-red-700 border-red-200 font-black'
                      : 'bg-slate-50 text-slate-700 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <List className="w-5 h-5 text-blue-600" />
                    <span>📁 All Policyholders ({clients.length})</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* 6:00 AM Cron Status Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1.5">
                <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Automatic 6:00 AM Dispatcher</span>
                </div>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  Every morning at <strong>6:00 AM IST</strong>, your system automatically scans for today's birthdays and delivers greetings.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      onSendAllToday();
                    }}
                    disabled={todayBirthdays.length === 0 || isSendingBulk}
                    className="w-full py-2.5 bg-red-600 active:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs text-center shadow-xs touch-target"
                  >
                    Check & Send Today's Wishes Now
                  </button>
                </div>
              </div>

              {/* Agent Profile Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>{agent.agent_name}</span>
                </div>
                <p className="text-slate-500 font-semibold">{agent.agent_role}</p>
                <p className="text-slate-600">📞 {agent.phone}</p>
                <p className="text-slate-600 font-mono text-[11px] truncate">📧 {agent.email}</p>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
              Department of Posts &bull; Government of India
            </div>
          </div>

          <div className="flex-1" onClick={() => setIsHamburgerOpen(false)}></div>
        </div>
      )}

      {/* 4. MAIN SCREEN CONTENT: SWITCHES BASED ON ACTIVE TAB */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">

        {activeTab === 'today' && (
          <div className="space-y-4">
            
            {/* Back to Home / Add Policyholder */}
            <div>
              <button
                onClick={() => setActiveTab('add')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-black border border-slate-200 shadow-xs transition-colors touch-target"
              >
                <ArrowLeft className="w-4 h-4 text-red-600" />
                <span>← Back to Add Policyholder</span>
              </button>
            </div>
            
            {/* Today's Celebration Header Banner */}
            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border-2 border-red-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center text-2xl shadow-md shadow-red-200 shrink-0">
                  🎂
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded">
                      Today's Celebrants
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-600 font-bold">
                      {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
                    {todayBirthdays.length > 0 
                      ? `${todayBirthdays.length} Policyholder${todayBirthdays.length > 1 ? 's have' : ' has'} a Birthday Today!`
                      : 'No Birthdays Today'}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {todayBirthdays.length > 0
                      ? `Automatic dispatch set for 6:00 AM IST daily via Resend API.`
                      : `All policyholders are up to date. Check upcoming celebrations below.`}
                  </p>
                </div>
              </div>

              {todayBirthdays.length > 0 && (
                <button
                  onClick={onSendAllToday}
                  disabled={isSendingBulk}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-red-600 active:bg-red-700 text-white font-extrabold text-sm shadow-md shadow-red-300 transition-all touch-target disabled:opacity-50"
                >
                  {isSendingBulk ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending via Resend...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Wishes to All Today ({todayBirthdays.length})</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* List of Today's Birthdays */}
            {todayBirthdays.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
                  <span>Policyholders Celebrating Today</span>
                  <span>{todayBirthdays.length} Active Policies</span>
                </div>

                <div className="space-y-3">
                  {todayBirthdays.map((client) => {
                    const age = calculateAge(client.date_of_birth);
                    const sent = hasSentToday(client.id);
                    const isSendingThis = sendingClientId === client.id;

                    return (
                      <div
                        key={client.id}
                        className="card-light rounded-2xl p-4 sm:p-5 transition-all bg-white border-2 border-red-300 ring-2 ring-red-400/20 shadow-xs"
                      >
                        {/* Top: Name & Badges */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-black text-slate-900 text-lg sm:text-xl">
                                {client.name}
                              </h3>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                client.policy_category === 'RPLI' || client.policy_number.startsWith('RPLI')
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-red-100 text-red-800 border border-red-300'
                              }`}>
                                {client.policy_category || (client.policy_number.startsWith('RPLI') ? 'RPLI' : 'PLI')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              {client.policy_type}
                            </p>
                          </div>

                          <span className="shrink-0 inline-flex items-center gap-1 text-xs font-black bg-amber-400 text-slate-950 px-3 py-1 rounded-full shadow-xs">
                            🎂 Turning {age}!
                          </span>
                        </div>

                        {/* Details */}
                        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                          <div className="flex items-center justify-between sm:justify-start gap-2">
                            <span className="text-slate-400 font-semibold">Policy No:</span>
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {client.policy_number}
                            </span>
                          </div>

                          <div className="flex items-center justify-between sm:justify-start gap-2 truncate">
                            <span className="text-slate-400 font-semibold">Customer Email:</span>
                            <span className="font-mono text-slate-800 truncate font-semibold">
                              {client.email}
                            </span>
                          </div>

                          {client.phone && (
                            <div className="flex items-center justify-between sm:justify-start gap-2">
                              <span className="text-slate-400 font-semibold">Phone:</span>
                              <span className="font-bold text-slate-800">
                                {client.phone}
                              </span>
                            </div>
                          )}

                          {client.policy_opening_date && (
                            <div className="flex items-center justify-between sm:justify-start gap-2">
                              <span className="text-slate-400 font-semibold">Policy Opened:</span>
                              <span className="font-medium text-slate-700">
                                {formatFriendlyDate(client.policy_opening_date)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Status */}
                        {sent && (
                          <div className="mt-2.5 flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Birthday greeting dispatched for today!</span>
                          </div>
                        )}

                        {/* ACTION BUTTONS (Edit, View, Wish, Delete) */}
                        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {/* Edit Action Button */}
                            <button
                              onClick={() => startEditing(client)}
                              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 active:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors touch-target"
                              title="Edit Policyholder Details"
                            >
                              <Edit className="w-3.5 h-3.5 text-blue-600" />
                              <span>Edit</span>
                            </button>

                            {/* View Details Action Button */}
                            <button
                              onClick={() => setInspectingClient(client)}
                              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 active:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors touch-target"
                              title="View Details"
                            >
                              <Info className="w-3.5 h-3.5 text-slate-500" />
                              <span>Details</span>
                            </button>

                            {/* Preview Email */}
                            <button
                              onClick={() => onPreviewClientEmail(client)}
                              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white active:bg-slate-100 text-slate-700 text-xs font-bold transition-colors touch-target"
                              title="Preview Email"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Preview</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Delete Action Button */}
                            <button
                              onClick={() => {
                                if (confirm(`Remove policyholder "${client.name}" (${client.policy_number})?`)) {
                                  onDeleteClient(client.id);
                                }
                              }}
                              className="p-2 rounded-xl text-slate-400 active:text-red-600 active:bg-red-50 transition-colors touch-target"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Send Wish Button */}
                            <button
                              onClick={() => handleSendSingle(client)}
                              disabled={isSendingThis || isSendingBulk}
                              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 active:bg-red-700 text-white text-xs font-black shadow-xs shadow-red-200 transition-all touch-target disabled:opacity-50"
                            >
                              {isSendingThis ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Sending...</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5" />
                                  <span>{sent ? 'Resend Wish' : 'Send Wish Now'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 sm:p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-3xl">
                  🎂
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                    No Policyholder Birthdays Today
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                    Your database has <strong>{clients.length}</strong> policyholders. You can browse the directory or add a new policyholder below.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('directory')}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 active:bg-slate-800 text-white font-bold text-xs touch-target flex items-center justify-center gap-2"
                  >
                    <List className="w-4 h-4" />
                    <span>View All Policyholders ({clients.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('add')}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-600 active:bg-red-700 text-white font-bold text-xs touch-target flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add New Policyholder</span>
                  </button>
                </div>

                {/* Upcoming Birthdays Preview */}
                {upcomingBirthdays.length > 0 && (
                  <div className="pt-6 border-t border-slate-100 text-left">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                      Upcoming Birthdays Soon
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {upcomingBirthdays.map(c => {
                        const days = getDaysUntilBirthday(c.date_of_birth);
                        const age = calculateAge(c.date_of_birth);
                        return (
                          <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-slate-900">{c.name}</div>
                              <div className="text-[11px] text-slate-500">{formatFriendlyDate(c.date_of_birth)} • Turning {age}</div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px]">
                              In {days} days
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {activeTab === 'directory' && (
          <div className="space-y-4">
            
            {/* Back to Home / Add Policyholder */}
            <div>
              <button
                onClick={() => setActiveTab('add')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-black border border-slate-200 shadow-xs transition-colors touch-target"
              >
                <ArrowLeft className="w-4 h-4 text-red-600" />
                <span>← Back to Add Policyholder</span>
              </button>
            </div>

            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>All Policyholders</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {filteredClients.length} of {clients.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage policy details, edit information, or trigger greeting emails.
                </p>
              </div>

              {/* Action: Add Policyholder Quick Button */}
              <button
                onClick={() => setActiveTab('add')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 active:bg-red-700 text-white font-bold text-xs touch-target shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Policyholder</span>
              </button>
            </div>

            {/* Filter Pills & Search */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name, policy no, email, scheme..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-base shadow-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 touch-target ${
                    categoryFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  All Categories ({clients.length})
                </button>

                <button
                  onClick={() => setCategoryFilter('pli')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 touch-target ${
                    categoryFilter === 'pli'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  PLI Only
                </button>

                <button
                  onClick={() => setCategoryFilter('rpli')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 touch-target ${
                    categoryFilter === 'rpli'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  RPLI Only
                </button>
              </div>
            </div>

            {/* Policyholders Cards */}
            <div className="space-y-3">
              {filteredClients.length === 0 ? (
                <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center text-slate-400">
                  <p className="text-base font-bold text-slate-700">No policyholders match your search</p>
                  <p className="text-xs text-slate-400 mt-1">Try clearing your search query or add a new policyholder.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('all');
                    }}
                    className="mt-3 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                  >
                    Clear Search Filters
                  </button>
                </div>
              ) : (
                filteredClients.map((client) => {
                  const isToday = isBirthdayToday(client.date_of_birth);
                  const daysUntil = getDaysUntilBirthday(client.date_of_birth);
                  const age = calculateAge(client.date_of_birth);
                  const sent = hasSentToday(client.id);
                  const isSendingThis = sendingClientId === client.id;

                  return (
                    <div
                      key={client.id}
                      className={`card-light rounded-2xl p-4 sm:p-5 transition-all bg-white border ${
                        isToday 
                          ? 'border-red-400 ring-2 ring-red-400/30 bg-red-50/30' 
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Top Row: Name & Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-slate-900 text-base sm:text-lg">
                              {client.name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              client.policy_category === 'RPLI' || client.policy_number.startsWith('RPLI')
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                              {client.policy_category || (client.policy_number.startsWith('RPLI') ? 'RPLI' : 'PLI')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {client.policy_type}
                          </p>
                        </div>

                        {/* Birthday Status Indicator */}
                        {isToday ? (
                          <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-black bg-amber-400 text-slate-950 px-2.5 py-1 rounded-full shadow-xs">
                            🎂 Turning {age}!
                          </span>
                        ) : daysUntil <= 7 ? (
                          <span className="shrink-0 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                            In {daysUntil}d
                          </span>
                        ) : null}
                      </div>

                      {/* Middle Info Details */}
                      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                        <div className="flex items-center justify-between sm:justify-start gap-2">
                          <span className="text-slate-400 font-semibold">Policy No:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {client.policy_number}
                            </span>
                            <button
                              onClick={() => handleCopyPolicy(client.policy_number)}
                              className="p-1 rounded text-slate-400 active:text-slate-800"
                              title="Copy policy number"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-start gap-2">
                          <span className="text-slate-400 font-semibold">Date of Birth:</span>
                          <span className="font-bold text-slate-800">
                            {formatFriendlyDate(client.date_of_birth)} ({age} yrs)
                          </span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-start gap-2 truncate">
                          <span className="text-slate-400 font-semibold">Email:</span>
                          <span className="font-mono text-slate-800 truncate">
                            {client.email}
                          </span>
                        </div>

                        {client.policy_opening_date && (
                          <div className="flex items-center justify-between sm:justify-start gap-2">
                            <span className="text-slate-400 font-semibold">Opened:</span>
                            <span className="font-medium text-slate-700">
                              {formatFriendlyDate(client.policy_opening_date)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status Pill if already sent */}
                      {sent && (
                        <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Greeting sent for this birthday</span>
                        </div>
                      )}

                      {/* ACTION BUTTONS (Edit, View, Wish, Delete) */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {/* Edit Action Button */}
                          <button
                            onClick={() => startEditing(client)}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-50 active:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors touch-target"
                            title="Edit Policyholder Details"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-600" />
                            <span>Edit</span>
                          </button>

                          {/* Details Button */}
                          <button
                            onClick={() => setInspectingClient(client)}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 active:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors touch-target"
                            title="View Full Policyholder Details"
                          >
                            <Info className="w-3.5 h-3.5 text-slate-500" />
                            <span>Details</span>
                          </button>

                          {/* Preview Email */}
                          <button
                            onClick={() => onPreviewClientEmail(client)}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white active:bg-slate-100 text-slate-700 text-xs font-bold transition-colors touch-target"
                            title="Preview Email"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Preview</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                            sent
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isToday
                                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {sent
                                ? '✓ Dispatched at 6 AM'
                                : isToday
                                  ? '⏰ 6 AM Auto-Dispatch'
                                  : `⏰ Auto: ${formatFriendlyDate(client.date_of_birth)}`}
                            </span>
                          </span>

                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              if (confirm(`Remove policyholder "${client.name}" (${client.policy_number})?`)) {
                                onDeleteClient(client.id);
                              }
                            }}
                            className="p-2 sm:p-2.5 rounded-xl text-slate-400 active:text-red-600 active:bg-red-50 transition-colors flex items-center justify-center touch-target"
                            title="Delete Policyholder"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* PAGE 1: ADD POLICYHOLDER HOMEPAGE (DEFAULT OPENING PAGE)            */}
        {/* ==================================================================== */}
        {activeTab === 'add' && (
          <div className="space-y-6 sm:space-y-8">
            
            {/* 1. PRESTIGIOUS POSTAL AGENT WELCOME HERO BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-700 via-red-800 to-rose-950 text-white shadow-xl shadow-red-900/10 border border-red-600/30">
              {/* Decorative Postal Stamp Pattern & Glow */}
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Shield className="w-48 h-48 text-white" />
              </div>

              <div className="relative p-4 sm:p-7 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
                  <div className="space-y-1.5 sm:space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-400 text-red-950 font-black text-[9px] sm:text-xs tracking-wider uppercase shadow-xs">
                        <IndianFlag className="w-4 h-2.5 sm:w-5 sm:h-3.5 shadow-xs" />
                        <span>GOVT. OF INDIA &bull; DAK VIBHAG</span>
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/60 border border-red-400/30 text-red-100 text-[11px] font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>6:00 AM IST Auto-Dispatch Active</span>
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                      Postal Life Insurance Portal
                    </h1>

                    <p className="text-xs sm:text-sm text-red-100/90 font-medium max-w-2xl leading-relaxed">
                      Official portal for <strong className="text-white font-bold">{agent.agent_name}</strong> &bull; {agent.agent_role} &bull; Attached to {agent.post_office}.
                    </p>
                  </div>

                  {/* Balanced 3-Column Stat Badges on All Screen Sizes */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0 pt-1 sm:pt-0">
                    <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center">
                      <div className="text-[9px] sm:text-[10px] uppercase font-bold text-red-200">Policies</div>
                      <div className="text-lg sm:text-3xl font-black text-white mt-0.5">{clients.length}</div>
                    </div>

                    <div 
                      onClick={() => setActiveTab('today')}
                      className={`rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center cursor-pointer transition-all border ${
                        todayBirthdays.length > 0 
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20 scale-105' 
                          : 'bg-white/10 backdrop-blur-md border-white/15 text-white'
                      }`}
                      title="View Today's Celebrations"
                    >
                      <div className={`text-[9px] sm:text-[10px] uppercase font-bold ${todayBirthdays.length > 0 ? 'text-slate-900' : 'text-red-200'}`}>
                        Birthdays
                      </div>
                      <div className="text-lg sm:text-3xl font-black mt-0.5 flex items-center justify-center gap-1">
                        <span>🎂</span>
                        <span>{todayBirthdays.length}</span>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center flex flex-col justify-center">
                      <div className="text-[9px] sm:text-[10px] uppercase font-bold text-red-200">Auto Send</div>
                      <div className="text-[10px] sm:text-xs font-black text-emerald-300 mt-1 flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>6 AM IST</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. TODAY'S CELEBRATION ALERT BANNER (IF ANY TODAY) */}
            {todayBirthdays.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-red-950 flex items-center justify-center text-2xl shadow-md shrink-0">
                    🎂
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded">
                        Celebration Today
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        {formatFriendlyDate(new Date().toISOString())}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                      {todayBirthdays[0].name} ({todayBirthdays[0].policy_number}) turns {calculateAge(todayBirthdays[0].date_of_birth)} today!
                    </h3>
                    <p className="text-xs text-slate-600">
                      Personalized birthday greeting scheduled for automated 6:00 AM IST email dispatch.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('today')}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-xs shrink-0 flex items-center justify-center gap-1.5 shadow-md shadow-red-200 touch-target"
                >
                  <span>View Celebrants ({todayBirthdays.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 3. MAIN POLICYHOLDER REGISTRATION CARD */}
            <div className="rounded-3xl p-5 sm:p-8 bg-white border border-slate-200/90 shadow-md shadow-slate-200/50 space-y-6">
              
              {/* Card Header */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-bold shadow-md shadow-red-200 shrink-0">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                        Register New Policyholder
                      </h2>
                      <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px] uppercase">
                        Instant Setup
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Enter details below. The system automatically schedules personalized birthday greetings every year on their special day at 6:00 AM IST.
                    </p>
                  </div>
                </div>

                {formSuccess && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✓ Successfully Saved!</span>
                  </span>
                )}
              </div>

              {/* Success Notification Alert */}
              {formSuccess && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-emerald-950 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-black text-emerald-900">Successfully Added to Postal Records!</p>
                      <p className="text-xs text-emerald-700">Their annual 6:00 AM IST birthday dispatch has been configured automatically.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('directory')}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black touch-target flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>View All Policyholders</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Validation Error Alert */}
              {formError && (
                <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 text-sm flex items-center justify-between gap-3 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center text-xs font-black shrink-0">!</span>
                    <div>
                      <p className="font-black text-red-900">Please Complete Required Information</p>
                      <p className="text-xs text-red-700 font-medium">{formError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormError('')}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-700 font-bold touch-target"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                {/* STEP 1: CATEGORY SELECTOR (PLI vs RPLI - Rich Interactive Cards) */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5">
                    1. Select Policy Category *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    
                    {/* PLI Card */}
                    <div
                      onClick={() => handleCategoryChange('PLI')}
                      className={`cursor-pointer p-4 sm:p-5 rounded-2xl border-2 transition-all relative flex items-start gap-3.5 ${
                        policyCategory === 'PLI'
                          ? 'border-red-600 bg-gradient-to-br from-red-50 to-rose-50/60 shadow-md shadow-red-100 ring-2 ring-red-500/20'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                        policyCategory === 'PLI' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                      }`}>
                        🏛️
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-base font-black ${policyCategory === 'PLI' ? 'text-red-900' : 'text-slate-800'}`}>
                            PLI (Postal Life Insurance)
                          </h4>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            policyCategory === 'PLI' ? 'border-red-600 bg-red-600' : 'border-slate-300'
                          }`}>
                            {policyCategory === 'PLI' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          For Govt, Defense, Paramilitary, PSU & Certified Professionals.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100/80 text-red-800">Santosh</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100/80 text-red-800">Suraksha</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100/80 text-red-800">Suvidha</span>
                        </div>
                      </div>
                    </div>

                    {/* RPLI Card */}
                    <div
                      onClick={() => handleCategoryChange('RPLI')}
                      className={`cursor-pointer p-4 sm:p-5 rounded-2xl border-2 transition-all relative flex items-start gap-3.5 ${
                        policyCategory === 'RPLI'
                          ? 'border-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50/60 shadow-md shadow-emerald-100 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                        policyCategory === 'RPLI' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                      }`}>
                        🌾
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-base font-black ${policyCategory === 'RPLI' ? 'text-emerald-900' : 'text-slate-800'}`}>
                            RPLI (Rural Postal Life Insurance)
                          </h4>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            policyCategory === 'RPLI' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                          }`}>
                            {policyCategory === 'RPLI' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          For Rural Citizens, Farmers, Village Residents & General Public.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800">Gram Santosh</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800">Gram Suraksha</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800">Gram Sumangal</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* SECTION 1: POLICYHOLDER ESSENTIALS */}
                <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-4">
                  <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                    <span>👤 Policyholder Identity</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-red-600" />
                        <span>2. Policyholder Name *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Chandra Sen"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-all shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Cake className="w-3.5 h-3.5 text-amber-500" />
                        <span>3. Date of Birth (DD/MM/YYYY) *</span>
                        <span className="text-[10px] text-amber-700 font-semibold">(Wishes trigger on this date)</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-all font-medium shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: POLICY DETAILS */}
                <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-4">
                  <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                    <span>🛡️ Policy Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-red-600" />
                        <span>4. Policy Number *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={policyCategory === 'PLI' ? 'e.g. PLI-OD-2023-887410' : 'e.g. RPLI-OD-2023-998811'}
                        value={policyNumber}
                        onChange={(e) => setPolicyNumber(e.target.value)}
                        className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-base uppercase transition-all shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>5. Policy Scheme / Plan *</span>
                      </label>
                      <select
                        value={policyScheme}
                        onChange={(e) => setPolicyScheme(e.target.value)}
                        className="w-full h-12 px-3 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-all font-medium shadow-xs"
                      >
                        {(policyCategory === 'PLI' ? PLI_SCHEMES : RPLI_SCHEMES).map((scheme) => (
                          <option key={scheme} value={scheme}>
                            {scheme}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        <span>6. Policy Opening Date (DD/MM/YYYY) *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={policyOpeningDate}
                        onChange={(e) => setPolicyOpeningDate(e.target.value)}
                        className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-all font-medium shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: COMMUNICATION & DISPATCH */}
                <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-4">
                  <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                    <span>✉️ Delivery & Contact Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span>7. Customer Mail ID (For Wishes) *</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. customer@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-all shadow-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Official postal birthday greeting will be automatically delivered here on their birthday at 6 AM.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>8. Customer Mobile / WhatsApp (Optional)</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98300 XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-all shadow-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        For SMS or WhatsApp customer service records.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON - DELUXE INDIA POST RED */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingPolicy}
                    className="w-full sm:w-auto min-w-[320px] flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:to-red-900 active:scale-[0.99] text-white font-black text-base shadow-xl shadow-red-700/25 transition-all touch-target border border-red-500/30 disabled:opacity-60"
                  >
                    {isSubmittingPolicy ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Saving to Postal Database...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5 text-red-200" />
                        <span>Save Policyholder & Schedule 6 AM Wishes</span>
                      </>
                    )}
                  </button>
                  
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                    <span className="text-emerald-700 font-bold">✓ Supabase Cloud Stored</span>
                    <span>&bull;</span>
                    <span className="text-slate-600 font-semibold">Automatic 6:00 AM IST Cron Active</span>
                    <span>&bull;</span>
                    <span className="text-slate-600 font-semibold">Resend API Certified</span>
                  </div>
                </div>

              </form>
            </div>

            {/* 5. POSTAL SYSTEM TRUST & AUTOMATION BANNER */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <IndianFlag className="w-10 h-7 rounded shadow-md shrink-0" />
                <div>
                  <h4 className="font-black text-white text-sm sm:text-base">
                    India Post Automated Birthday Greeting System
                  </h4>
                  <p className="text-xs text-slate-300">
                    Running 365 days a year for Postal Agents {agent.agent_name}. Daily 6:00 AM IST scheduled dispatch.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs shrink-0">
                <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400">Schedule: </span>
                  <span className="font-bold text-amber-300">06:00 AM Daily</span>
                </div>
                <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400">Server: </span>
                  <span className="font-bold text-emerald-300">Online</span>
                </div>
              </div>
            </div>

          </div>
        )}



      </main>

      {/* ==================================================================== */}
      {/* 5. EDIT POLICYHOLDER MODAL (FOR FATHER & MOTHER)                     */}
      {/* ==================================================================== */}
      {editingClient && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingClient(null); }}
        >
          <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 my-auto">
            
            {/* Modal Header */}
            <div className="bg-red-700 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white">Edit Policyholder Details</h3>
                  <p className="text-[11px] text-red-100">Update policy info for {editingClient.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingClient(null)}
                className="p-1.5 rounded-lg text-red-200 hover:text-white active:bg-red-800 transition-colors touch-target"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Error Notification Alert */}
            {editError && (
              <div className="p-3 bg-red-50 border-b border-red-200 text-red-900 text-xs font-bold flex items-center justify-between px-5">
                <span>⚠️ {editError}</span>
                <button onClick={() => setEditError('')} className="text-red-500 hover:text-red-800">✕</button>
              </div>
            )}

            {/* Modal Form Body */}
            <form onSubmit={handleSaveEdit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Category Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Policy Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditCategoryChange('PLI')}
                    className={`py-2.5 px-3 rounded-xl border-2 font-bold text-sm touch-target ${
                      editCategory === 'PLI'
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    PLI
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditCategoryChange('RPLI')}
                    className={`py-2.5 px-3 rounded-xl border-2 font-bold text-sm touch-target ${
                      editCategory === 'RPLI'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    RPLI
                  </button>
                </div>
              </div>

              {/* Name & Policy Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Policyholder Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 bg-white text-base focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Policy Number *
                </label>
                <input
                  type="text"
                  required
                  value={editPolicyNumber}
                  onChange={(e) => setEditPolicyNumber(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 bg-white font-mono text-base uppercase focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Scheme */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Scheme / Plan *
                </label>
                <select
                  value={editScheme}
                  onChange={(e) => setEditScheme(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-slate-900 bg-white text-base font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {(editCategory === 'PLI' ? PLI_SCHEMES : RPLI_SCHEMES).map((scheme) => (
                    <option key={scheme} value={scheme}>
                      {scheme}
                    </option>
                  ))}
                </select>
              </div>

              {/* DOB & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Birth (DD/MM/YYYY) *
                  </label>
                  <input
                    type="date"
                    required
                    value={editDOB}
                    onChange={(e) => setEditDOB(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-slate-900 bg-white text-base font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Mail ID *
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 bg-white text-base focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Opening Date & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Policy Opening Date (DD/MM/YYYY)
                  </label>
                  <input
                    type="date"
                    value={editOpeningDate}
                    onChange={(e) => setEditOpeningDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-slate-900 bg-white text-base font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 bg-white text-base focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-sm touch-target"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 active:bg-red-700 text-white font-black text-sm shadow-md shadow-red-200 touch-target disabled:opacity-60"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating Database...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. DEDICATED POLICYHOLDER DETAILS (CENTERED DIALOG)                 */}
      {/* ==================================================================== */}
      {inspectingClient && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setInspectingClient(null); }}
        >
          <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 my-auto">
            
            {/* Header */}
            <div className="bg-red-700 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-300" />
                <h3 className="font-black text-base sm:text-lg text-white">Policyholder Details</h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Direct Edit Button from inside Details */}
                <button
                  onClick={() => {
                    const c = inspectingClient;
                    setInspectingClient(null);
                    startEditing(c);
                  }}
                  className="flex items-center gap-1 bg-red-800 hover:bg-red-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-red-600 touch-target"
                >
                  <Edit className="w-3.5 h-3.5 text-amber-300" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setInspectingClient(null)}
                  className="p-1.5 rounded-lg text-red-200 hover:text-white active:bg-red-800 transition-colors touch-target"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Details Content (Scrollable) */}
            <div className="p-5 sm:p-6 space-y-4 text-sm overflow-y-auto">
              
              {/* Name & Category Badge */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Customer Name</div>
                  <div className="text-xl font-black text-slate-900">{inspectingClient.name}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  inspectingClient.policy_category === 'RPLI'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {inspectingClient.policy_category} (Postal)
                </span>
              </div>

              {/* Policy Number */}
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Policy Number</div>
                  <div className="font-mono text-base font-black text-slate-900">{inspectingClient.policy_number}</div>
                </div>
                <button
                  onClick={() => handleCopyPolicy(inspectingClient.policy_number)}
                  className="flex items-center gap-1.5 text-xs text-red-600 font-bold bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-xs touch-target"
                >
                  {copiedPolicyNo ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPolicyNo ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Scheme */}
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scheme / Plan</div>
                <div className="font-bold text-slate-800 text-base">{inspectingClient.policy_type}</div>
              </div>

              {/* DOB & Age */}
              <div className="grid grid-cols-2 gap-3 bg-red-50/60 p-3.5 rounded-xl border border-red-100">
                <div>
                  <div className="text-[10px] text-red-800 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Cake className="w-3.5 h-3.5 text-red-600" />
                    <span>Date of Birth</span>
                  </div>
                  <div className="font-black text-slate-900 mt-0.5">{formatFriendlyDate(inspectingClient.date_of_birth)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-red-800 font-bold uppercase tracking-wider">Age</div>
                  <div className="font-black text-slate-900 mt-0.5">{calculateAge(inspectingClient.date_of_birth)} years</div>
                </div>
              </div>

              {/* Customer Email & Phone */}
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Customer Mail ID</span>
                  </div>
                  <div className="font-bold text-slate-800 font-mono text-sm break-all">{inspectingClient.email}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Policy Opening Date</span>
                  </div>
                  <div className="font-semibold text-slate-800">{formatFriendlyDate(inspectingClient.policy_opening_date)}</div>
                </div>

                {inspectingClient.phone && (
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mobile / WhatsApp</span>
                    </div>
                    <div className="font-semibold text-slate-800">
                      <a href={`tel:${inspectingClient.phone}`} className="text-blue-600 font-bold underline">
                        {inspectingClient.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Birthday Wish Status:</span>
                {hasSentToday(inspectingClient.id) ? (
                  <span className="font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    ✓ Sent Today
                  </span>
                ) : (
                  <span className="font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    Pending
                  </span>
                )}
              </div>

            </div>

            {/* Actions Footer */}
            <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0 pb-safe">
              <button
                onClick={() => setInspectingClient(null)}
                className="px-4 py-3 rounded-xl bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs touch-target"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const c = inspectingClient;
                    setInspectingClient(null);
                    onPreviewClientEmail(c);
                  }}
                  className="px-3.5 py-3 rounded-xl bg-white active:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs touch-target"
                >
                  Preview
                </button>

                <button
                  onClick={() => {
                    const c = inspectingClient;
                    setInspectingClient(null);
                    handleSendSingle(c);
                  }}
                  className="px-4 py-3 rounded-xl bg-red-600 active:bg-red-700 text-white font-black text-xs shadow-md shadow-red-200 touch-target"
                >
                  Send Wish Now
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 7. STICKY MOBILE BOTTOM NAVIGATION BAR FOR PARENTS */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-2xl pb-safe">
        
        {/* Button 1: Add Policy (Default Opening Page) */}
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all touch-target ${
            activeTab === 'add' 
              ? 'text-red-700 font-black bg-red-50/80 scale-105 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900 active:bg-slate-100 font-bold'
          }`}
        >
          <PlusCircle className={`w-5 h-5 ${activeTab === 'add' ? 'text-red-600 stroke-[2.5]' : 'text-slate-500'}`} />
          <span className="text-[11px] mt-0.5">Add Policy</span>
        </button>

        {/* Button 2: Today's Birthdays */}
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative touch-target ${
            activeTab === 'today' 
              ? 'text-red-700 font-black bg-red-50/80 scale-105 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900 active:bg-slate-100 font-bold'
          }`}
        >
          <div className="relative">
            <Cake className={`w-5 h-5 ${activeTab === 'today' ? 'text-red-600 stroke-[2.5]' : 'text-amber-500'}`} />
            {todayBirthdays.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
                {todayBirthdays.length}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5">Birthdays</span>
        </button>

        {/* Button 3: All Policies */}
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all touch-target ${
            activeTab === 'directory' 
              ? 'text-red-700 font-black bg-red-50/80 scale-105 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900 active:bg-slate-100 font-bold'
          }`}
        >
          <List className={`w-5 h-5 ${activeTab === 'directory' ? 'text-red-600 stroke-[2.5]' : 'text-slate-500'}`} />
          <span className="text-[11px] mt-0.5">All Policies</span>
        </button>

      </nav>

    </div>
  );
};
