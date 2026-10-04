import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Client } from '../types';

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseClient(url: string, anonKey: string): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (cachedClient && cachedUrl === url && cachedKey === anonKey) {
    return cachedClient;
  }
  try {
    cachedClient = createClient(url, anonKey);
    cachedUrl = url;
    cachedKey = anonKey;
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

// Insert single policyholder
export async function insertPolicyholderToSupabase(
  url: string, 
  anonKey: string, 
  clientData: Omit<Client, 'id' | 'created_at'>
): Promise<string | null> {
  const client = getSupabaseClient(url, anonKey);
  if (!client) return null;

  try {
    const { data, error } = await client.from('policyholders').insert([{
      name: clientData.name,
      policy_number: clientData.policy_number,
      policy_category: clientData.policy_category,
      policy_type: clientData.policy_type,
      date_of_birth: clientData.date_of_birth,
      email: clientData.email,
      policy_opening_date: clientData.policy_opening_date || null,
      phone: clientData.phone || null,
    }]).select('id').single();

    if (error) {
      console.error('Supabase insert error:', error.message);
      return null;
    }
    return data?.id || null;
  } catch (err) {
    console.error('Supabase insert error:', err);
    return null;
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
): Promise<boolean> {
  const client = getSupabaseClient(url, anonKey);
  if (!client) return false;

  try {
    const { error } = await client
      .from('policyholders')
      .update({
        name: clientData.name,
        policy_number: clientData.policy_number,
        policy_category: clientData.policy_category,
        policy_type: clientData.policy_type,
        date_of_birth: clientData.date_of_birth,
        email: clientData.email,
        policy_opening_date: clientData.policy_opening_date || null,
        phone: clientData.phone || null,
      })
      .eq('id', clientData.id);

    if (error) {
      console.error('Supabase update error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase update policyholder error:', err);
    return false;
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
