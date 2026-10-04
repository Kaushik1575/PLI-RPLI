import { Client, AgentProfile, EmailTemplate, EmailLog } from '../types';

// Helper to generate dynamic dates relative to today
const today = new Date();
const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
const currentDay = String(today.getDate()).padStart(2, '0');

// Tomorrow
const tomorrowDate = new Date();
tomorrowDate.setDate(today.getDate() + 1);
const tomMonth = String(tomorrowDate.getMonth() + 1).padStart(2, '0');
const tomDay = String(tomorrowDate.getDate()).padStart(2, '0');

// In 3 days
const in3Days = new Date();
in3Days.setDate(today.getDate() + 3);
const in3Month = String(in3Days.getMonth() + 1).padStart(2, '0');
const in3Day = String(in3Days.getDate()).padStart(2, '0');

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-101',
    name: 'Rajesh Mukherjee',
    email: 'rajesh.mukherjee@example.com',
    phone: '+91 98301 24590',
    date_of_birth: `1985-${currentMonth}-${currentDay}`, // TODAY!
    policy_number: 'PLI-WB-2020-847291',
    policy_category: 'PLI',
    policy_type: 'Santosh (Endowment Assurance)',
    policy_opening_date: '2020-05-14',
    created_at: '2023-01-15T10:00:00Z',
  },
  {
    id: 'cli-102',
    name: 'Sunita Sharma',
    email: 'sunita.sharma@example.com',
    phone: '+91 98220 89123',
    date_of_birth: `1992-${currentMonth}-${currentDay}`, // TODAY!
    policy_number: 'PLI-MH-2018-491024',
    policy_category: 'PLI',
    policy_type: 'Suraksha (Whole Life Assurance)',
    policy_opening_date: '2018-11-20',
    created_at: '2023-02-10T11:30:00Z',
  },
  {
    id: 'cli-103',
    name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@example.com',
    phone: '+91 94231 77209',
    date_of_birth: `1990-${tomMonth}-${tomDay}`, // Tomorrow
    policy_number: 'PLI-MH-2021-309182',
    policy_category: 'PLI',
    policy_type: 'Suvidha (Convertible Whole Life)',
    policy_opening_date: '2021-03-08',
    created_at: '2023-03-01T09:15:00Z',
  },
  {
    id: 'cli-104',
    name: 'Vikramaditya Roy',
    email: 'vikram.roy@example.com',
    phone: '+91 98450 12894',
    date_of_birth: `1978-${in3Month}-${in3Day}`, // In 3 days
    policy_number: 'PLI-KA-2019-982143',
    policy_category: 'PLI',
    policy_type: 'Sumangal (Anticipated Endowment)',
    policy_opening_date: '2019-09-12',
    created_at: '2023-04-12T14:20:00Z',
  },
  {
    id: 'cli-105',
    name: 'Pooja Verma',
    email: 'pooja.verma@example.com',
    phone: '+91 97110 34812',
    date_of_birth: '1995-12-05',
    policy_number: 'RPLI-DL-2022-771923',
    policy_category: 'RPLI',
    policy_type: 'Gram Santosh (Rural Endowment)',
    policy_opening_date: '2022-04-15',
    created_at: '2023-06-22T10:10:00Z',
  },
  {
    id: 'cli-106',
    name: 'Gopal Krishna Iyer',
    email: 'gopal.iyer@example.com',
    phone: '+91 94440 67123',
    date_of_birth: '1965-10-25',
    policy_number: 'PLI-TN-2015-625102',
    policy_category: 'PLI',
    policy_type: 'Suraksha (Whole Life Assurance)',
    policy_opening_date: '2015-08-01',
    created_at: '2023-07-01T08:30:00Z',
  }
];

export const INITIAL_AGENT_PROFILE: AgentProfile = {
  agent_name: 'Amulya Kumar Das & Sasmita Das',
  agent_role: 'Postal Insurance Agents — India Post',
  agency_code: 'PLI/AGT/DAS/74921',
  post_office: 'Head Post Office',
  phone: '+91 98300 12345',
  email: 'amulya.sasmita.pli@gmail.com',
  auto_send_enabled: true,
  auto_send_time: '06:00 AM',
  custom_signature: 'Dedicated to your financial protection under Postal Life Insurance.'
};

export const INITIAL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-amulya-sasmita-custom',
    name: 'Official Greeting by Amulya Kumar Das & Sasmita Das',
    theme: 'postal_royal',
    subject: '🎂 Happy Birthday {client_name}! Warm Wishes from Amulya Kumar Das & Sasmita Das 🌸',
    greeting_heading: '🌸 Warm greetings from Amulya Kumar Das & Sasmita Das.',
    message_body: `Dear {client_name},

🌸 Warm greetings from Amulya Kumar Das & Sasmita Das.

🎉 We are delighted to wish you a very Happy Birthday on this special occasion! 🎂

📋 Your Policy Details:
🔹 Policy Number: {policy_no}
🔹 Date of Birth: {birth_date}
🔹 Age: {age} years

✨ May this special day bring you happiness, good health, peace, and prosperity. We sincerely wish you a wonderful year ahead filled with success, joy, and many memorable moments. 🌷

🤝 Thank you for your continued trust and association with us.

🎂 Once again, Happy Birthday, {client_name}! 🎉
May your special day be filled with happiness and beautiful moments. ✨

Warm regards,
Amulya Kumar Das & Sasmita Das
📋 Postal Insurance Agents
📞 {agent_phone}
📧 {agent_email}`,
    include_policy_summary: false,
    include_premium_reminder_blurb: false,
    footer_text: 'Postal Life Insurance • Department of Posts, Government of India'
  }
];

export const INITIAL_LOGS: EmailLog[] = [];
