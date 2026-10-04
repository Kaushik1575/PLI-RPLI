export interface Client {
  id: string;
  name: string;                  // Policyholder Name
  policy_number: string;         // Policy Number
  policy_category: 'PLI' | 'RPLI'; // PLI or RPLI
  policy_type: string;           // Policy Scheme (Santosh, Suraksha, etc.)
  date_of_birth: string;         // Date of Birth (YYYY-MM-DD)
  email: string;                 // Customer Mail ID
  policy_opening_date: string;   // Policy Opening Date (YYYY-MM-DD)
  phone: string;                 // Mobile / WhatsApp Number
  last_birthday_wish_sent?: string; // Timestamp when birthday email was sent
  created_at?: string;
}

export interface EmailLog {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  policy_number: string;
  policy_type: string;
  sent_at: string;
  status: 'sent' | 'failed' | 'simulated';
  subject: string;
  template_id: string;
  error_message?: string;
  resend_id?: string;
}

export interface AgentProfile {
  agent_name: string;
  agent_role: string;
  agency_code: string;
  post_office: string;
  phone: string;
  email: string;
  auto_send_enabled: boolean;
  auto_send_time: string;
  custom_signature: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  theme: 'postal_royal' | 'warm_celebration' | 'golden_executive' | 'modern_minimal';
  subject: string;
  greeting_heading: string;
  message_body: string;
  include_policy_summary: boolean;
  include_premium_reminder_blurb: boolean;
  footer_text: string;
}

export interface SupabaseSettings {
  url: string;
  anon_key: string;
  is_connected: boolean;
}

export interface ResendSettings {
  api_key: string;
  sender_name: string;
  sender_email: string;
  is_connected: boolean;
  simulation_mode: boolean;
}

export interface BirthdayStats {
  todayCount: number;
  thisWeekCount: number;
  thisMonthCount: number;
  totalClients: number;
  totalSentCount: number;
}
