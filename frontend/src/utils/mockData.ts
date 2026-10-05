import { Client, AgentProfile, EmailTemplate, EmailLog } from '../types';

export const INITIAL_CLIENTS: Client[] = [];


export const INITIAL_AGENT_PROFILE: AgentProfile = {
  agent_name: 'Amulya Kumar Das & Sasmita Das',
  agent_role: 'Postal Insurance Agents — India Post',
  agency_code: 'PLI/AGT/DAS/74921',
  post_office: 'Head Post Office',
  phone: '+91 8328809918',
  email: 'sasmitadas22041979@gmail.com',
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
