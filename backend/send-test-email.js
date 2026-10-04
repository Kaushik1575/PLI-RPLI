import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
const RESEND_SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL || 'onboarding@jitus.tech';
const AGENT_NAME = process.env.AGENT_NAME || 'Amulya Kumar Das & Sasmita Das';
const AGENT_ROLE = process.env.AGENT_ROLE || 'Postal Insurance Agents';
const AGENT_PHONE = process.env.AGENT_PHONE || '+91 8328809918';
const AGENT_EMAIL = process.env.AGENT_EMAIL || 'sasmitadas22041979@gmail.com';

const targetEmail = process.argv[2] || 'dask64576@gmail.com';

console.log('--- SENDING ENHANCED BRANDED BIRTHDAY EMAIL ---');
console.log('To:', targetEmail);

if (!RESEND_API_KEY) {
  console.error('ERROR: RESEND_API_KEY is not defined in .env');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

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

function formatFriendlyDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function maskPolicyNumber(policyNumber) {
  if (!policyNumber) return 'XXXX-XXXX';
  const clean = String(policyNumber).trim();
  if (clean.length <= 4) return `XXXX-${clean}`;
  return `XXXX-XXXX-${clean.slice(-4)}`;
}

export function buildModernBirthdayEmailHtml(policyholder) {
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
                      ${AGENT_NAME}
                    </div>
                    <div style="font-size: 13px; font-weight: 700; color: #dc2626; margin-top: 1px;">
                      📋 ${AGENT_ROLE} (PLI / RPLI)
                    </div>
                    <div style="font-size: 13px; color: #334155; margin-top: 6px;">
                      📞 <strong>Mobile / WhatsApp:</strong> <a href="tel:${AGENT_PHONE.replace(/\s+/g, '')}" style="color: #0f172a; text-decoration: none; font-weight: 600;">${AGENT_PHONE}</a>
                    </div>
                    <div style="font-size: 13px; color: #334155; margin-top: 3px;">
                      📧 <strong>Official Email:</strong> <a href="mailto:${AGENT_EMAIL}" style="color: #dc2626; text-decoration: none; font-weight: 600;">${AGENT_EMAIL}</a>
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

async function send() {
  const dummyPolicyholder = {
    name: 'Krushna Chandra Das',
    policy_number: 'PLI-OD-2021-98765',
    policy_category: 'PLI',
    policy_type: 'Santosh (Endowment Assurance)',
    date_of_birth: '1998-10-04',
    policy_opening_date: '2021-03-15',
    email: targetEmail
  };

  const { subject, html } = buildModernBirthdayEmailHtml(dummyPolicyholder);

  try {
    const response = await resend.emails.send({
      from: `${AGENT_NAME} <${RESEND_SENDER_EMAIL}>`,
      to: [targetEmail],
      subject: subject,
      html: html,
    });

    console.log('RESEND RESPONSE:', JSON.stringify(response, null, 2));
    if (response.error) {
      console.error('FAILED TO SEND:', response.error);
    } else {
      console.log('✅ SUCCESS! Email ID:', response.data?.id);
    }
  } catch (err) {
    console.error('EXCEPTION:', err);
  }
}

send();
