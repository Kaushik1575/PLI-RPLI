import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Configuration from environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || '';
const RESEND_SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL || process.env.VITE_RESEND_SENDER_EMAIL || 'onboarding@jitus.tech';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// Agent Profile
const AGENT = {
  name: 'Amulya Kumar Das & Sasmita Das',
  role: 'Postal Insurance Agents',
  phone: process.env.AGENT_PHONE || '+91 8328809918',
  email: process.env.AGENT_EMAIL || 'sasmitadas22041979@gmail.com'
};

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

/**
 * Calculates Age from DOB (YYYY-MM-DD)
 */
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 0;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    return age - 1;
  }
  return age;
}

/**
 * Formats Friendly Date like "15 Aug 1988"
/**
 * Formats any date string strictly into DD/MM/YYYY format.
 * Example: "2005-10-05" -> "05/10/2005"
 */
function formatFriendlyDate(dateStr) {
  if (!dateStr) return '';
  const clean = String(dateStr).trim().split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Calculates completed policy tenure years
 */
function calculateTenure(openingDate) {
  if (!openingDate) return null;
  const opened = new Date(openingDate);
  if (isNaN(opened.getTime())) return null;
  const today = new Date();
  let years = today.getFullYear() - opened.getFullYear();
  const m = today.getMonth() - opened.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < opened.getDate())) {
    years--;
  }
  const tenure = Math.max(0, years);
  if (tenure === 0) return '1st Year of Journey (Active & Protected)';
  if (tenure === 1) return '1 Year Completed 🌟';
  return `${tenure} Years Successfully Completed 🏆`;
}

/**
 * Masks a policy number for security in customer emails.
 * Only the last 4 characters/digits are shown, preceded by XXXX-XXXX-
 * Example: "PLI-OD-2023-887410" -> "XXXX-XXXX-7410"
 */
function maskPolicyNumber(policyNumber) {
  if (!policyNumber) return 'XXXX-XXXX';
  const clean = String(policyNumber).trim();
  if (clean.length <= 4) return `XXXX-${clean}`;
  return `XXXX-XXXX-${clean.slice(-4)}`;
}

/**
 * Builds HTML Email Template for Amulya Kumar Das & Sasmita Das with India Post Logo & Milestone
 */
function buildBirthdayEmailHtml(policyholder) {
  const age = calculateAge(policyholder.date_of_birth);
  const formattedDob = formatFriendlyDate(policyholder.date_of_birth);
  const formattedOpening = policyholder.policy_opening_date ? formatFriendlyDate(policyholder.policy_opening_date) : 'N/A';
  const tenureText = policyholder.policy_opening_date ? calculateTenure(policyholder.policy_opening_date) : 'Active Policy';
  const policyCategory = policyholder.policy_category || 'PLI';
  const policyType = policyholder.policy_type || 'Postal Life Insurance';

  const subject = `🌸 Happy Birthday ${policyholder.name}! Warm Wishes from Amulya Kumar Das & Sasmita Das (India Post PLI) 🎂`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 30px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
          
          <!-- Official Indian National Tricolor Ribbon -->
          <tr>
            <td style="padding: 0; margin: 0; line-height: 0; font-size: 0; height: 6px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; height: 6px;">
                <tr>
                  <td width="33.33%" bgcolor="#FF671F" style="background-color: #FF671F; height: 6px; font-size: 1px; line-height: 6px;">&nbsp;</td>
                  <td width="33.34%" bgcolor="#FFFFFF" style="background-color: #FFFFFF; height: 6px; font-size: 1px; line-height: 6px; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">&nbsp;</td>
                  <td width="33.33%" bgcolor="#046A38" style="background-color: #046A38; height: 6px; font-size: 1px; line-height: 6px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- India Post Brand Header with Crystal-Clear HD Logo & National Flag -->
          <tr>
            <td style="background-color: #ffffff; padding: 20px 24px 18px 24px; border-bottom: 2px solid #f1f5f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="105" valign="middle" align="center" style="padding-right: 14px;">
                    <img src="https://thumb.wikimedia.org/wikipedia/en/thumb/3/32/India_Post.svg/960px-India_Post.svg.png" alt="India Post Logo" width="100" style="display: block; width: 100px; max-width: 100px; height: auto; border: none; outline: none;" />
                  </td>
                  <td valign="middle">
                    <div style="font-size: 17px; font-weight: 900; color: #b91c1c; letter-spacing: 0.5px; text-transform: uppercase; line-height: 1.2;">
                      भारतीय डाक • INDIA POST
                    </div>
                    <div style="font-size: 13px; font-weight: 700; color: #334155; margin-top: 4px; line-height: 1.3;">
                      डाक जीवन बीमा / ग्रामीण डाक जीवन बीमा (${policyCategory})
                    </div>
                    <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-top: 3px;">
                      Department of Posts • Government of India
                    </div>
                  </td>
                  <td width="42" valign="middle" align="right" style="padding-left: 8px;">
                    <img src="https://thumb.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/960px-Flag_of_India.svg.png" alt="Indian Flag" width="40" style="display: block; width: 40px; height: auto; border-radius: 4px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.12);" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Celebratory Hero Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #991b1b 0%, #c21825 50%, #dc2626 100%); padding: 36px 28px; text-align: center; color: #ffffff;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.22); border: 1px solid rgba(255, 255, 255, 0.35); padding: 6px 18px; border-radius: 9999px; margin-bottom: 14px; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #fef08a;">
                🎉 Official Birthday Felicitations 🎂
              </div>
              <h1 style="margin: 0; font-size: 26px; line-height: 1.3; font-weight: 800; color: #ffffff;">
                Happy Birthday,<br/>${policyholder.name}!
              </h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #fee2e2; font-weight: 500;">
                Warmest greetings & heartfelt blessings on your special day 🌸
              </p>
            </td>
          </tr>

          <!-- Main Greeting Body -->
          <tr>
            <td style="padding: 32px 28px; background-color: #ffffff; color: #1e293b; font-size: 15px; line-height: 1.75;">
              <p style="margin: 0 0 16px 0; font-size: 16px;">
                Dear <strong>${policyholder.name}</strong>,
              </p>

              <p style="margin: 0 0 16px 0;">
                🌸 <strong>Warm greetings from Amulya Kumar Das & Sasmita Das.</strong>
              </p>

              <p style="margin: 0 0 22px 0;">
                🎉 We are truly delighted to wish you a very <strong>Happy Birthday</strong> on this joyous occasion! May your day be blessed with vibrant joy, sound health, and peace of mind. 🎂
              </p>

              <!-- Distinctive Policy & Milestone Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(180deg, #fdf8f6 0%, #fef2f2 100%); border: 1px solid #fecaca; border-radius: 14px; margin: 24px 0; overflow: hidden;">
                <tr>
                  <td style="background-color: #dc2626; padding: 10px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="font-size: 12px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">
                          📋 YOUR POLICY DETAILS & MILESTONES
                        </td>
                        <td align="right" style="font-size: 12px; font-weight: 700; color: #fef08a;">
                          ${policyCategory}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 10px; font-size: 14px; color: #475569;" width="45%">
                          🔹 <strong>Policy Number:</strong>
                        </td>
                        <td style="padding-bottom: 10px; font-size: 14px; font-weight: 700; color: #0f172a;" width="55%">
                          ${maskPolicyNumber(policyholder.policy_number)} <span style="font-size: 11px; font-weight: 500; color: #64748b; margin-left: 4px;">(Masked for Security)</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px; font-size: 14px; color: #475569;">
                          🔹 <strong>Plan / Scheme:</strong>
                        </td>
                        <td style="padding-bottom: 10px; font-size: 14px; font-weight: 600; color: #0f172a;">
                          ${policyType} (${policyCategory})
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px; font-size: 14px; color: #475569;">
                          🔹 <strong>Date of Birth:</strong>
                        </td>
                        <td style="padding-bottom: 10px; font-size: 14px; font-weight: 600; color: #0f172a;">
                          ${formattedDob} <span style="color: #dc2626; font-weight: 700;">(Age: ${age} yrs)</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px; font-size: 14px; color: #475569;">
                          🔹 <strong>Policy Opening Date:</strong>
                        </td>
                        <td style="padding-bottom: 10px; font-size: 14px; font-weight: 600; color: #0f172a;">
                          ${formattedOpening}
                        </td>
                      </tr>
                      <tr>
                        <td style="border-top: 1px dashed #fca5a5; padding-top: 10px; font-size: 14px; color: #475569;">
                          🌟 <strong>Policy Completed:</strong>
                        </td>
                        <td style="border-top: 1px dashed #fca5a5; padding-top: 10px; font-size: 14px; font-weight: 800; color: #b91c1c;">
                          ${tenureText}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0;">
                ✨ May this special day bring you everlasting happiness, good health, peace, and prosperity. We sincerely wish you a wonderful year ahead filled with success, joy, and many memorable moments with your loved ones. 🌷
              </p>

              <p style="margin: 0 0 20px 0;">
                🤝 <strong>Thank you for your continued trust and association with us.</strong> We take immense pride in securing your future with the Government of India's Postal Life Insurance.
              </p>

              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #92400e;">
                🎂 <strong>Once again, Happy Birthday, ${policyholder.name}!</strong> 🎉<br/>
                May your special day be filled with happiness and beautiful moments. ✨
              </div>

              <!-- Official Agent Signature Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 28px; border-top: 2px dashed #e2e8f0; padding-top: 22px;">
                <tr>
                  <td width="60" valign="top">
                    <div style="width: 50px; height: 50px; border-radius: 12px; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); text-align: center; line-height: 50px; font-size: 24px; border: 1px solid #f87171;">
                      📮
                    </div>
                  </td>
                  <td valign="top" style="padding-left: 12px;">
                    <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700;">
                      Warm regards & best wishes,
                    </div>
                    <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                      ${AGENT.name}
                    </div>
                    <div style="font-size: 13px; font-weight: 700; color: #dc2626; margin-top: 1px;">
                      📋 ${AGENT.role} (PLI / RPLI)
                    </div>
                    <div style="font-size: 13px; color: #334155; margin-top: 6px;">
                      📞 <strong>Mobile / WhatsApp:</strong> <a href="tel:${AGENT.phone.replace(/\s+/g, '')}" style="color: #0f172a; text-decoration: none; font-weight: 600;">${AGENT.phone}</a>
                    </div>
                    <div style="font-size: 13px; color: #334155; margin-top: 3px;">
                      📧 <strong>Official Email:</strong> <a href="mailto:${AGENT.email}" style="color: #dc2626; text-decoration: none; font-weight: 600;">${AGENT.email}</a>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Official Government & Postal Footer -->
          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 22px 28px; text-align: center; font-size: 12px; line-height: 1.6;">
              <div style="color: #f1f5f9; font-weight: 700; font-size: 13px; margin-bottom: 4px;">
                🇮🇳 Government of India • Department of Posts
              </div>
              <div>
                Postal Life Insurance (PLI) & Rural Postal Life Insurance (RPLI) — Insuring Lives Since 1884
              </div>
              <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
                This is an official automated birthday greeting dispatched by authorized Postal Agents.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

/**
 * Core Daily 6:00 AM Birthday Dispatch Logic
 */
export async function executeDailyBirthdayCheck() {
  console.log(`\n======================================================`);
  console.log(`[${new Date().toISOString()}] ⏰ Running Automatic 6:00 AM Birthday Scan...`);
  console.log(`Agent: ${AGENT.name} (${AGENT.role})`);
  console.log(`======================================================`);

  if (!supabase) {
    console.warn('⚠️ Supabase credentials not found. Set SUPABASE_URL and SUPABASE_KEY in .env.');
    return { success: false, message: 'Supabase credentials missing' };
  }

  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const todayIsoDate = today.toISOString().split('T')[0];

    // Query policyholders from the single table
    const { data: policyholders, error } = await supabase
      .from('policyholders')
      .select('*');

    if (error) {
      console.error('❌ Error querying policyholders from Supabase:', error.message);
      return { success: false, error: error.message };
    }

    if (!policyholders || policyholders.length === 0) {
      console.log('ℹ️ No policyholders registered in Supabase policyholders table.');
      return { success: true, count: 0, dispatched: 0 };
    }

    // Filter today's birthday celebrants
    const todayBirthdays = policyholders.filter(p => {
      if (!p.date_of_birth) return false;
      const dob = new Date(p.date_of_birth);
      return (dob.getMonth() + 1 === currentMonth) && (dob.getDate() === currentDay);
    });

    console.log(`🎂 Found ${todayBirthdays.length} policyholder(s) celebrating a birthday today (${currentDay}/${currentMonth}).`);

    let dispatchedCount = 0;

    for (const person of todayBirthdays) {
      // Check if already sent today to prevent duplicate emails
      if (person.last_birthday_wish_sent && person.last_birthday_wish_sent.startsWith(todayIsoDate)) {
        console.log(`⏩ Skipping ${person.name} (${person.email}): already sent greeting today at ${person.last_birthday_wish_sent}.`);
        continue;
      }

      const { subject, html } = buildBirthdayEmailHtml(person);

      if (resend) {
        // Send Real Email via Resend
        try {
          const sendRes = await resend.emails.send({
            from: `${AGENT.name} <${RESEND_SENDER_EMAIL}>`,
            to: person.email,
            subject: subject,
            html: html,
          });

          if (sendRes.error) {
            console.error(`❌ Resend returned error for ${person.name} <${person.email}>:`, sendRes.error.message || sendRes.error);
            continue;
          }

          console.log(`✅ Dispatched Birthday Email via Resend to ${person.name} <${person.email}>! (ID: ${sendRes.data?.id})`);

          // Update last_birthday_wish_sent timestamp in Supabase
          await supabase
            .from('policyholders')
            .update({ last_birthday_wish_sent: new Date().toISOString() })
            .eq('id', person.id);

          dispatchedCount++;
        } catch (resendErr) {
          console.error(`❌ Failed to send email via Resend to ${person.email}:`, resendErr.message);
        }
      } else {
        // Simulation Mode (if API key not provided yet)
        console.log(`📢 [Simulation Mode] Dispatched 6 AM Birthday Greeting to ${person.name} <${person.email}>!`);
        
        await supabase
          .from('policyholders')
          .update({ last_birthday_wish_sent: new Date().toISOString() })
          .eq('id', person.id);

        dispatchedCount++;
      }
    }

    console.log(`✨ 6:00 AM Scan Completed! Sent: ${dispatchedCount} / ${todayBirthdays.length} greetings.\n`);
    return { success: true, count: todayBirthdays.length, dispatched: dispatchedCount };
  } catch (err) {
    console.error('❌ Unexpected error in executeDailyBirthdayCheck:', err);
    return { success: false, error: err.message };
  }
}

// =====================================================================
// SCHEDULED AUTOMATION: Runs Every Day at 6:00 AM IST (Asia/Kolkata)
// Cron Expression: 0 6 * * * -> Minute 0, Hour 6, Every day
// =====================================================================
cron.schedule('0 6 * * *', () => {
  executeDailyBirthdayCheck();
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata' // Indian Standard Time (IST)
});

console.log('⏰ Auto-Scheduler Initialized: Will run automatically EVERY DAY AT 6:00 AM IST (Asia/Kolkata).');

// =====================================================================
// REST API ENDPOINTS (For frontend integration and health monitor)
// =====================================================================

// Health check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'DakPost PLI Birthday Automation Backend',
    agents: AGENT.name,
    cronSchedule: 'Every day at 06:00 AM IST (0 6 * * *)',
    timezone: 'Asia/Kolkata',
    hasResendKey: Boolean(RESEND_API_KEY),
    hasSupabase: Boolean(supabase),
    currentTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  });
});

// Trigger 6 AM check immediately on demand
app.post('/api/trigger-birthday-check', async (req, res) => {
  const result = await executeDailyBirthdayCheck();
  res.json(result);
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`\n📮 DakPost PLI Backend Server listening on http://localhost:${PORT}`);
  console.log(`🌐 Health endpoint: http://localhost:${PORT}/api/status`);

  // Non-blocking catch-up: if server was started/rebooted after 6:00 AM, send any pending greetings
  setTimeout(() => {
    console.log('🔍 Running catch-up scan for any unfulfilled birthday emails today...');
    executeDailyBirthdayCheck();
  }, 2000);
});
