import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Upload, 
  Download, 
  Cake, 
  Mail, 
  Phone, 
  Trash2, 
  Edit3, 
  Send, 
  Eye, 
  FileSpreadsheet, 
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import { Client } from '../types';
import { isBirthdayToday, getDaysUntilBirthday, formatFriendlyDate, calculateAge } from '../utils/dateUtils';

interface ClientsManagerProps {
  clients: Client[];
  onAddClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onPreviewClientEmail: (client: Client) => void;
  onSendSingleEmail: (client: Client) => Promise<void>;
  onImportCsv: (imported: Client[]) => void;
}

export const ClientsManager: React.FC<ClientsManagerProps> = ({
  clients,
  onAddClient,
  onEditClient,
  onDeleteClient,
  onPreviewClientEmail,
  onSendSingleEmail,
  onImportCsv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'today' | 'this_month' | 'pli' | 'rpli'>('all');
  const [selectedPolicyType, setSelectedPolicyType] = useState<string>('all');
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Search term
      const matchesSearch = 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.policy_type.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Filter types
      if (filterType === 'today') {
        return isBirthdayToday(client.date_of_birth);
      }
      if (filterType === 'this_month') {
        const clientMonth = new Date(client.date_of_birth).getMonth();
        const currentMonth = new Date().getMonth();
        return clientMonth === currentMonth;
      }
      if (filterType === 'pli') {
        return client.policy_number.toUpperCase().startsWith('PLI');
      }
      if (filterType === 'rpli') {
        return client.policy_number.toUpperCase().startsWith('RPLI') || client.policy_type.toLowerCase().includes('rural') || client.policy_type.toLowerCase().includes('gram');
      }

      if (selectedPolicyType !== 'all') {
        return client.policy_type === selectedPolicyType;
      }

      return true;
    });
  }, [clients, searchTerm, filterType, selectedPolicyType]);

  // Export CSV handler
  const handleExportCsv = () => {
    const headers = ['Name', 'Email', 'Phone', 'DateOfBirth', 'PolicyNumber', 'PolicyCategory', 'PolicyType', 'PolicyOpeningDate'];
    const rows = clients.map(c => [
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.date_of_birth}"`,
      `"${c.policy_number}"`,
      `"${c.policy_category}"`,
      `"${c.policy_type}"`,
      `"${c.policy_opening_date}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PLI_Policyholders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sample CSV template
  const handleDownloadSampleCsv = () => {
    const sampleHeaders = 'Name,Email,Phone,DateOfBirth,PolicyNumber,PolicyCategory,PolicyType,PolicyOpeningDate';
    const sampleRows = [
      'Subhash Chandra Sen,subhash.sen@example.com,+91 98300 11223,1986-10-02,PLI-WB-2022-998811,PLI,Santosh (Endowment Assurance),2022-01-15',
      'Priya Banerjee,priya.b@example.com,+91 98311 44556,1993-10-03,PLI-WB-2021-443322,PLI,Suraksha (Whole Life Assurance),2021-06-20',
      'Manoj Kumar,manoj.k@example.com,+91 94330 99887,1980-11-15,RPLI-WB-2020-112233,RPLI,Gram Santosh (Rural Endowment),2020-03-10'
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + sampleHeaders + '\n' + sampleRows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'PLI_Policyholder_Sample_Import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import File input handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
          alert('CSV file is empty or missing headers.');
          return;
        }

        const parsedClients: Client[] = [];
        // Skip header line
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
          if (cols.length >= 5 && cols[0] && cols[1]) {
            parsedClients.push({
              id: `imported-${Date.now()}-${i}`,
              name: cols[0],
              email: cols[1],
              phone: cols[2] || '',
              date_of_birth: cols[3] || '1990-01-01',
              policy_number: cols[4] || `PLI-${Math.floor(100000 + Math.random() * 900000)}`,
              policy_category: (cols[5] && cols[5].toUpperCase() === 'RPLI') || (cols[4] && cols[4].toUpperCase().startsWith('RPLI')) ? 'RPLI' : 'PLI',
              policy_type: cols[6] || cols[5] || 'Santosh (Endowment Assurance)',
              policy_opening_date: cols[7] || '2023-01-01',
              created_at: new Date().toISOString()
            });
          }
        }

        if (parsedClients.length > 0) {
          onImportCsv(parsedClients);
          setImportNotification(`Successfully imported ${parsedClients.length} policyholder records!`);
          setTimeout(() => setImportNotification(null), 5000);
        } else {
          alert('Could not parse valid client records from this CSV.');
        }
      } catch (err: any) {
        alert(`Error parsing CSV: ${err.message}`);
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-red-500" />
            Policyholder Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your Postal Life Insurance (PLI) and Rural PLI (RPLI) client database and track birthdays.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition-colors">
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            title="Export all clients to CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export</span>
          </button>

          <button
            onClick={handleDownloadSampleCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
            title="Download formatted sample CSV file"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <span>Sample CSV</span>
          </button>

          <button
            onClick={onAddClient}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Policyholder</span>
          </button>
        </div>
      </div>

      {/* Import Success Banner */}
      {importNotification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{importNotification}</span>
          </div>
          <button onClick={() => setImportNotification(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, policy number, or branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
              filterType === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All ({clients.length})
          </button>
          <button
            onClick={() => setFilterType('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 flex items-center gap-1 ${
              filterType === 'today'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🎂 Today's Birthdays</span>
            <span className="bg-amber-400/30 text-amber-300 px-1.5 py-0.2 rounded-full text-[10px]">
              {clients.filter(c => isBirthdayToday(c.date_of_birth)).length}
            </span>
          </button>
          <button
            onClick={() => setFilterType('this_month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
              filterType === 'this_month'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setFilterType('pli')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
              filterType === 'pli'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            PLI Only
          </button>
          <button
            onClick={() => setFilterType('rpli')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
              filterType === 'rpli'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            RPLI (Rural)
          </button>
        </div>

      </div>

      {/* Clients Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Policyholder Details</th>
                <th className="py-3.5 px-4">Policy / Scheme</th>
                <th className="py-3.5 px-4">Date of Birth</th>
                <th className="py-3.5 px-4">Next Birthday</th>
                <th className="py-3.5 px-4">Branch</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <p className="text-base font-semibold text-slate-400">No policyholders found</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const isToday = isBirthdayToday(client.date_of_birth);
                  const daysUntil = getDaysUntilBirthday(client.date_of_birth);
                  const age = calculateAge(client.date_of_birth);

                  return (
                    <tr
                      key={client.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isToday ? 'bg-red-950/20' : ''
                      }`}
                    >
                      {/* Name & Contact */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            isToday
                              ? 'bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-md shadow-red-600/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {isToday ? '🎂' : client.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{client.name}</span>
                              {isToday && (
                                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase">
                                  Today
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1 text-slate-400">
                                <Mail className="w-3 h-3 text-slate-500" />
                                {client.email}
                              </span>
                              {client.phone && (
                                <span className="hidden sm:flex items-center gap-1 text-slate-400">
                                  <Phone className="w-3 h-3 text-slate-500" />
                                  {client.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Policy & Scheme */}
                      <td className="py-4 px-4">
                        <div className="font-mono text-xs font-semibold text-slate-200">
                          {client.policy_number}
                        </div>
                        <div className="text-xs text-red-300 font-medium mt-0.5">
                          {client.policy_type}
                        </div>
                      </td>

                      {/* Date of Birth & Age */}
                      <td className="py-4 px-4">
                        <div className="text-xs font-medium text-slate-200">
                          {formatFriendlyDate(client.date_of_birth)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Age: {age} yrs
                        </div>
                      </td>

                      {/* Next Birthday Status */}
                      <td className="py-4 px-4">
                        {isToday ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-full animate-pulse">
                            <Cake className="w-3.5 h-3.5 text-amber-400" />
                            Birthday Today!
                          </span>
                        ) : daysUntil === 1 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-200 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                            Tomorrow
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            In {daysUntil} days
                          </span>
                        )}
                      </td>

                      {/* Opening Date */}
                      <td className="py-4 px-4 text-xs text-slate-400 max-w-[150px] truncate">
                        {formatFriendlyDate(client.policy_opening_date)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Preview Email */}
                          <button
                            onClick={() => onPreviewClientEmail(client)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Preview Birthday Greeting Email"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          

                          {/* Edit */}
                          <button
                            onClick={() => onEditClient(client)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Policyholder"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove policyholder "${client.name}"?`)) {
                                onDeleteClient(client.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete Policyholder"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
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
