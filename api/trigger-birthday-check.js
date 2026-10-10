import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Agent Profile
const AGENT = {
  name: 'Amulya Kumar Das & Sasmita Das',
  role: 'Postal Insurance Agents',
  phone: process.env.AGENT_PHONE || '+91 8328809918',
  email: process.env.AGENT_EMAIL || 'sasmitadas22041979@gmail.com'
};

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

function formatFriendlyDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

function calculateTenureYears(startDateStr) {
  if (!startDateStr) return 1;
  const start = new Date(startDateStr);
  const now = new Date();
  const diffYears = now.getFullYear() - start.getFullYear();
  return Math.max(1, diffYears);
}

function buildBirthdayEmailHtml(policyholder) {
  const age = calculateAge(policyholder.date_of_birth);
  const tenureYears = calculateTenureYears(policyholder.policy_start_date || policyholder.created_at);
  const formattedDob = formatFriendlyDate(policyholder.date_of_birth);
  const isRpli = (policyholder.policy_type || '').toUpperCase().includes('RPLI');
  const policyCategory = isRpli ? 'Rural Postal Life Insurance (RPLI)' : 'Postal Life Insurance (PLI)';
  const maskedPolicyNumber = policyholder.policy_number 
    ? policyholder.policy_number.replace(/^(.{4})(.*)(.{4})$/, '$1-XXXX-$3')
    : 'POL-XXXX-SECURE';

  const subject = `🎂 Happy Birthday ${policyholder.name}! Warm Wishes from India Post PLI Family`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
          
          <!-- Tricolor Ribbon -->
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

          <!-- India Post Brand Header -->
          <tr>
            <td style="background-color: #ffffff; padding: 20px 24px 18px 24px; border-bottom: 2px solid #f1f5f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="105" valign="middle" align="center" style="padding-right: 14px;">
                    <img src="https://thumb.wikimedia.org/wikipedia/en/thumb/3/32/India_Post.svg/960px-India_Post.svg.png" alt="India Post Logo" width="100" style="display: block; width: 100px; max-width: 100px; height: auto; border: none;" />
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
                    <img src="https://thumb.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/960px-Flag_of_India.svg.png" alt="Indian Flag" width="40" style="display: block; width: 40px; height: auto; border-radius: 4px; border: 1px solid #e2e8f0;" />
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

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 30px; color: #334155; line-height: 1.6; font-size: 15px;">
              <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #0f172a;">
                Respected <strong>${policyholder.name}</strong> ji,
              </p>
              <p style="margin-bottom: 20px; color: #475569;">
                On this auspicious occasion of your <strong>${age ? `${age}th ` : ''}Birthday</strong> (${formattedDob}), we extend our warmest felicitations and heartfelt blessings to you and your esteemed family!
              </p>

              <!-- Milestone & Policy Details Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 24px 0;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; background-color: #f1f5f9; border-top-left-radius: 11px; border-top-right-radius: 11px;">
                    <strong style="color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                      📋 Policyholder Relationship Summary
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px;">
                      <tr>
                        <td width="40%" style="padding: 6px 0; color: #64748b;">Policy Holder:</td>
                        <td width="60%" style="padding: 6px 0; color: #0f172a; font-weight: 700;">${policyholder.name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b;">Policy Number:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 700; font-family: monospace;">${maskedPolicyNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b;">Plan Type:</td>
                        <td style="padding: 6px 0; color: #b91c1c; font-weight: 700;">${policyholder.policy_type || 'Postal Life Insurance'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b;">Relationship Milestone:</td>
                        <td style="padding: 6px 0; color: #047857; font-weight: 700;">${tenureYears}+ Years of Trusted Protection ⭐</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Financial Wellbeing Quote -->
              <p style="color: #475569; font-size: 14px; margin-bottom: 24px;">
                May this year bring immense good health, joy, and prosperity to you and your loved ones. We are truly honored to safeguard your family's future with the sovereign guarantee of Government of India.
              </p>

              <!-- Agent Sign-off & Contacts -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 2px dashed #e2e8f0; padding-top: 20px; margin-top: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 14px; font-weight: 700; color: #0f172a;">
                      With Best Regards & Good Wishes,
                    </div>
                    <div style="font-size: 15px; font-weight: 800; color: #b91c1c; margin-top: 4px;">
                      ${AGENT.name}
                    </div>
                    <div style="font-size: 12px; color: #64748b; font-weight: 600;">
                      ${AGENT.role} • India Post PLI
                    </div>
                    <div style="font-size: 12px; color: #475569; margin-top: 6px;">
                      📞 <strong>Phone:</strong> ${AGENT.phone} &nbsp;|&nbsp; ✉️ <strong>Email:</strong> ${AGENT.email}
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Official Government Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0; font-weight: 600;">
                Government of India • Ministry of Communications • Department of Posts
              </p>
              <p style="margin: 4px 0 0 0; color: #94a3b8;">
                This is an official automated birthday greeting dispatched by your designated Postal Insurance Agents.
              </p>
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

export default async function handler(req, res) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || '';
  const RESEND_SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL || process.env.VITE_RESEND_SENDER_EMAIL || 'onboarding@jitus.tech';
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase credentials not configured' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

  try {
    // Current date strictly in Indian Standard Time (IST)
    const now = new Date();
    const istDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
    const [istYear, istMonth, istDay] = istDateStr.split('-').map(Number);

    // Fetch all policyholders
    const { data: policyholders, error } = await supabase
      .from('policyholders')
      .select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Filter today's celebrants based on IST month and day
    const todayBirthdays = (policyholders || []).filter(p => {
      if (!p.date_of_birth) return false;
      const parts = p.date_of_birth.split('-');
      const dobMonth = parseInt(parts[1], 10);
      const dobDay = parseInt(parts[2], 10);
      return dobMonth === istMonth && dobDay === istDay;
    });

    let dispatchedCount = 0;
    const results = [];

    for (const person of todayBirthdays) {
      // Prevent duplicates if already sent today in IST
      if (person.last_birthday_wish_sent) {
        try {
          const sentDate = new Date(person.last_birthday_wish_sent);
          const sentIst = sentDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
          if (sentIst === istDateStr || person.last_birthday_wish_sent.startsWith(istDateStr)) {
            results.push({ name: person.name, email: person.email, status: 'already_sent_today' });
            continue;
          }
        } catch (e) {
          if (person.last_birthday_wish_sent.startsWith(istDateStr)) {
            results.push({ name: person.name, email: person.email, status: 'already_sent_today' });
            continue;
          }
        }
      }


      const { subject, html } = buildBirthdayEmailHtml(person);

      if (resend) {
        try {
          const sendRes = await resend.emails.send({
            from: `${AGENT.name} <${RESEND_SENDER_EMAIL}>`,
            to: person.email,
            subject: subject,
            html: html,
          });

          if (sendRes.error) {
            results.push({ name: person.name, email: person.email, status: 'error', error: sendRes.error });
            continue;
          }

          await supabase
            .from('policyholders')
            .update({ last_birthday_wish_sent: now.toISOString() })
            .eq('id', person.id);

          dispatchedCount++;
          results.push({ name: person.name, email: person.email, status: 'dispatched', resendId: sendRes.data?.id });
        } catch (sendErr) {
          results.push({ name: person.name, email: person.email, status: 'error', error: sendErr.message });
        }
      } else {
        // Simulation
        await supabase
          .from('policyholders')
          .update({ last_birthday_wish_sent: now.toISOString() })
          .eq('id', person.id);

        dispatchedCount++;
        results.push({ name: person.name, email: person.email, status: 'simulated' });
      }
    }

    return res.status(200).json({
      success: true,
      istDate: istDateStr,
      celebrantsCount: todayBirthdays.length,
      dispatchedCount,
      results
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
