import { Client, AgentProfile, EmailTemplate } from '../types';
import { calculateAge, formatFriendlyDate, maskPolicyNumber } from './dateUtils';

function calculateTenure(openingDate?: string): string {
  if (!openingDate) return 'Active Policy';
  const opened = new Date(openingDate);
  if (isNaN(opened.getTime())) return 'Active Policy';
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

export function generateBirthdayEmailHtml(
  client: Client,
  agent: AgentProfile,
  template: EmailTemplate
): { subject: string; html: string; text: string } {
  const age = calculateAge(client.date_of_birth);
  const formattedDob = formatFriendlyDate(client.date_of_birth);
  const formattedOpening = client.policy_opening_date ? formatFriendlyDate(client.policy_opening_date) : 'N/A';
  const tenureText = calculateTenure(client.policy_opening_date);
  const policyCategory = client.policy_category || 'PLI';

  // Replace variable tags in subject & body
  const replaceTags = (str: string): string => {
    return str
      .replace(/{client_name}/g, client.name)
      .replace(/{policy_no}/g, maskPolicyNumber(client.policy_number))
      .replace(/{policy_type}/g, client.policy_type)
      .replace(/{birth_date}/g, formattedDob)
      .replace(/{age}/g, age ? String(age) : '')
      .replace(/{agent_name}/g, agent.agent_name)
      .replace(/{agent_phone}/g, agent.phone)
      .replace(/{agent_email}/g, agent.email)
      .replace(/{branch}/g, agent.post_office);
  };

  const subject = `🌸 Happy Birthday ${client.name}! Warm Wishes from Amulya Kumar Das & Sasmita Das (India Post PLI) 🎂`;
  const heading = replaceTags(template.greeting_heading);
  const plainText = `${heading}\n\n${replaceTags(template.message_body)}`;

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
                Happy Birthday,<br/>${client.name}!
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
                Dear <strong>${client.name}</strong>,
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
                          ${maskPolicyNumber(client.policy_number)} <span style="font-size: 11px; font-weight: 500; color: #64748b; margin-left: 4px;">(Masked for Security)</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px; font-size: 14px; color: #475569;">
                          🔹 <strong>Plan / Scheme:</strong>
                        </td>
                        <td style="padding-bottom: 10px; font-size: 14px; font-weight: 600; color: #0f172a;">
                          ${client.policy_type} (${policyCategory})
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
                🎂 <strong>Once again, Happy Birthday, ${client.name}!</strong> 🎉<br/>
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
                      ${agent.agent_name}
                    </div>
                    <div style="font-size: 13px; font-weight: 700; color: #dc2626; margin-top: 1px;">
                      📋 Postal Insurance Agents (PLI / RPLI)
                    </div>
                    <div style="font-size: 13px; color: #334155; margin-top: 6px;">
                      📞 <strong>Mobile / WhatsApp:</strong> <a href="tel:${agent.phone.replace(/\s+/g, '')}" style="color: #0f172a; text-decoration: none; font-weight: 600;">${agent.phone}</a>
                    </div>
                    <div style="font-size: 13px; color: #334155; margin-top: 3px;">
                      📧 <strong>Official Email:</strong> <a href="mailto:${agent.email}" style="color: #dc2626; text-decoration: none; font-weight: 600;">${agent.email}</a>
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

  return { subject, html, text: plainText };
}
