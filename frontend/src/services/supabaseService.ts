import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Client } from '../types';

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

/**
 * Robustly sanitizes and extracts a valid Supabase project URL,
 * preventing corrupted strings where URLs get concatenated repeatedly.
 */
export function cleanSupabaseUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  const match = trimmed.match(/https?:\/\/[a-z0-9_-]+\.supabase\.co/i);
  if (match) return match[0];
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const secondHttp = trimmed.indexOf('http', 7);
    if (secondHttp !== -1) {
      return trimmed.slice(0, secondHttp);
    }
    return trimmed;
  }
  return trimmed;
}

export function getSupabaseClient(url: string, anonKey: string): SupabaseClient | null {
  const sanitizedUrl = cleanSupabaseUrl(url);
  const sanitizedKey = (anonKey || '').trim();
  if (!sanitizedUrl || !sanitizedKey) return null;
  if (cachedClient && cachedUrl === sanitizedUrl && cachedKey === sanitizedKey) {
    return cachedClient;
  }
  try {
    cachedClient = createClient(sanitizedUrl, sanitizedKey);
    cachedUrl = sanitizedUrl;
    cachedKey = sanitizedKey;
    return cachedClient;
  } catch (err) {
    console.error('Error creating Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = getSupabaseClient(url, anonKey);
    if (!client) {
      return { success: false, message: 'Please enter both Supabase URL and Anon Key.' };
    }
    const { error } = await client.from('policyholders').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return { 
          success: true, 
          message: 'Connected to Supabase! The "policyholders" table does not exist yet. Please run the SQL schema script provided below.' 
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to your Supabase "policyholders" table!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection failed' };
  }
}

// Fetch all policyholders from Supabase
export async function fetchPolicyholdersFromSupabase(url: string, anonKey: string): Promise<Client[]> {
  const client = getSupabaseClient(url, anonKey);
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('policyholders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Could not fetch from Supabase policyholders table:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      policy_number: row.policy_number,
      policy_category: row.policy_category || (row.policy_number.startsWith('RPLI') ? 'RPLI' : 'PLI'),
      policy_type: row.policy_type,
      date_of_birth: row.date_of_birth,
      email: row.email,
      policy_opening_date: row.policy_opening_date || '',
      phone: row.phone || '',
      sum_assured: 500000,
      premium_amount: 2000,
      premium_frequency: 'Monthly',
      post_office_branch: 'Head Post Office',
      policy_status: 'Active',
      created_at: row.created_at,
    }));
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return [];
  }
}

/**
 * Normalizes any date string (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, or ISO string)
 * into PostgreSQL's standard 'YYYY-MM-DD' format.
 */
export function normalizeDateForDatabase(dateStr?: string | null): string | null {
  if (!dateStr || dateStr.trim() === '') return null;
  const clean = dateStr.trim().split('T')[0];

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Fallback Date parser
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
}

// Insert single policyholder
export async function insertPolicyholderToSupabase(
  url: string, 
  anonKey: string, 
  clientData: Omit<Client, 'id' | 'created_at'>
): Promise<{ id: string | null; error: string | null }> {
  const client = getSupabaseClient(url, anonKey);
  if (!client) return { id: null, error: 'Database not connected' };

  try {
    const dob = normalizeDateForDatabase(clientData.date_of_birth);
    if (!dob) {
      return { id: null, error: 'Please enter a valid Date of Birth.' };
    }
    const opening = normalizeDateForDatabase(clientData.policy_opening_date);
    const phoneClean = clientData.phone && clientData.phone.trim() !== '+91' && clientData.phone.trim() !== '+91 '
      ? clientData.phone.trim() 
      : null;

    const { data, error } = await client.from('policyholders').insert([{
      name: clientData.name.trim(),
      policy_number: clientData.policy_number.trim().toUpperCase(),
      policy_category: clientData.policy_category || 'PLI',
      policy_type: clientData.policy_type,
      date_of_birth: dob,
      email: clientData.email.trim(),
      policy_opening_date: opening,
      phone: phoneClean,
    }]).select('id').single();

    if (error) {
      console.error('Supabase insert error:', error.message);
      return { id: null, error: error.message };
    }
    return { id: data?.id || null, error: null };
  } catch (err: any) {
    console.error('Supabase insert error:', err);
    return { id: null, error: err?.message || 'Failed to save to database' };
  }
}

// Mark birthday greeting sent
export async function updateBirthdayWishSentInSupabase(url: string, anonKey: string, id: string): Promise<void> {
  const client = getSupabaseClient(url, anonKey);
  if (!client) return;

  try {
    await client
      .from('policyholders')
      .update({ last_birthday_wish_sent: new Date().toISOString() })
      .eq('id', id);
  } catch (err) {
    console.error('Supabase update error:', err);
  }
}

// Update existing policyholder details
export async function updatePolicyholderInSupabase(
  url: string,
  anonKey: string,
  clientData: Client
): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabaseClient(url, anonKey);
  if (!client) return { success: false, error: 'Database not connected' };

  try {
    const dob = normalizeDateForDatabase(clientData.date_of_birth);
    const opening = normalizeDateForDatabase(clientData.policy_opening_date);
    const phoneClean = clientData.phone && clientData.phone.trim() !== '+91' && clientData.phone.trim() !== '+91 '
      ? clientData.phone.trim() 
      : null;

    const { error } = await client
      .from('policyholders')
      .update({
        name: clientData.name.trim(),
        policy_number: clientData.policy_number.trim().toUpperCase(),
        policy_category: clientData.policy_category || 'PLI',
        policy_type: clientData.policy_type,
        date_of_birth: dob,
        email: clientData.email.trim(),
        policy_opening_date: opening,
        phone: phoneClean,
      })
      .eq('id', clientData.id);

    if (error) {
      console.error('Supabase update error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Supabase update policyholder error:', err);
    return { success: false, error: err?.message || 'Update failed' };
  }
}

// Delete policyholder
export async function deletePolicyholderFromSupabase(url: string, anonKey: string, id: string): Promise<void> {
  const client = getSupabaseClient(url, anonKey);
  if (!client) return;

  try {
    await client.from('policyholders').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase delete error:', err);
  }
}

// Single table minimal SQL schema
export const SUPABASE_SQL_SCHEMA = `-- ======================================================================
-- DAKPOST PLI: SINGLE TABLE FOR BIRTHDAY NOTIFICATIONS
-- Stores only what the postal agent enters in the website form.
-- ======================================================================

CREATE TABLE IF NOT EXISTS public.policyholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    policy_number TEXT NOT NULL,
    policy_category TEXT NOT NULL DEFAULT 'PLI', -- 'PLI' or 'RPLI'
    policy_type TEXT NOT NULL,                  -- Scheme name (Santosh, Suraksha, etc.)
    date_of_birth DATE NOT NULL,                -- Used to trigger birthday wishes
    email TEXT NOT NULL,                        -- Customer email for birthday greeting
    policy_opening_date DATE,                   -- Commencement date
    phone TEXT,                                 -- Customer phone / WhatsApp
    last_birthday_wish_sent TIMESTAMPTZ,        -- Timestamp when greeting was sent
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fast Index for Birthday Queries (matches day and month)
CREATE INDEX IF NOT EXISTS idx_policyholders_dob ON public.policyholders (
    EXTRACT(MONTH FROM date_of_birth),
    EXTRACT(DAY FROM date_of_birth)
);

-- Enable Row Level Security (RLS) & Allow access
ALTER TABLE public.policyholders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on policyholders" ON public.policyholders FOR ALL USING (true) WITH CHECK (true);
`;
