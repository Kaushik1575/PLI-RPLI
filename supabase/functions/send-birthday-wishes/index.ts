// @ts-nocheck
// ==============================================================================
// SUPABASE EDGE FUNCTION: Automatic Daily 6:00 AM Birthday Email Dispatcher
// File: supabase/functions/send-birthday-wishes/index.ts
// ==============================================================================

declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";
import { createClient } from "npm:@supabase/supabase-js";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const RESEND_SENDER_EMAIL = Deno.env.get("RESEND_SENDER_EMAIL") || "onboarding@jitus.tech";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_KEY") || "";

const AGENT_NAME = Deno.env.get("AGENT_NAME") || "Amulya Kumar Das & Sasmita Das";
const AGENT_ROLE = Deno.env.get("AGENT_ROLE") || "Postal Insurance Agents";
const AGENT_PHONE = Deno.env.get("AGENT_PHONE") || "+91 8328809918";
const AGENT_EMAIL = Deno.env.get("AGENT_EMAIL") || "sasmitadas22041979@gmail.com";

const resend = new Resend(RESEND_API_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function calculateAge(dateOfBirth: string): number {
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

function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

serve(async (_req) => {
  try {
    const today = new Date();
    // Indian Standard Time (UTC + 5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(today.getTime() + istOffset);
    const currentMonth = istDate.getUTCMonth() + 1;
    const currentDay = istDate.getUTCDate();
    const todayIsoDate = istDate.toISOString().split('T')[0];

    console.log(`[6:00 AM IST Check] Checking birthdays for Date: ${currentDay}/${currentMonth}...`);

    // 1. Query only from the single simple table "policyholders"
    const { data: policyholders, error } = await supabase
      .from("policyholders")
      .select("id, name, policy_number, policy_category, policy_type, date_of_birth, email, policy_opening_date, phone, last_birthday_wish_sent");

    if (error) {
      console.error("Supabase query error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // 2. Filter policyholders whose birthday is today
    const birthdayPeople = (policyholders || []).filter((p) => {
      if (!p.date_of_birth) return false;
      const dob = new Date(p.date_of_birth);
      return (dob.getMonth() + 1 === currentMonth) && (dob.getDate() === currentDay);
    });

    console.log(`Found ${birthdayPeople.length} policyholder(s) celebrating today!`);

    let sentCount = 0;

    // 3. Dispatch emails via Resend
    for (const person of birthdayPeople) {
      // Avoid sending duplicate if already sent today
      if (person.last_birthday_wish_sent && person.last_birthday_wish_sent.startsWith(todayIsoDate)) {
        console.log(`Skipping ${person.name}: already wished today.`);
        continue;
      }

      const age = calculateAge(person.date_of_birth);
      const formattedDob = formatFriendlyDate(person.date_of_birth);
      const formattedOpening = person.policy_opening_date ? formatFriendlyDate(person.policy_opening_date) : 'N/A';
      const tenureText = calculateTenure(person.policy_opening_date);
      const policyCategory = person.policy_category || 'PLI';
      const policyType = person.policy_type || 'Postal Life Insurance';

      const emailSubject = `🌸 Happy Birthday ${person.name}! Warm Wishes from Amulya Kumar Das & Sasmita Das (India Post PLI) 🎂`;
      
      const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
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
                Happy Birthday,<br/>${person.name}!
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
                Dear <strong>${person.name}</strong>,
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
                          ${person.policy_number}
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
                🎂 <strong>Once again, Happy Birthday, ${person.name}!</strong> 🎉<br/>
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

      // Dispatch through Resend
      await resend.emails.send({
        from: `${AGENT_NAME} <${RESEND_SENDER_EMAIL}>`,
        to: person.email,
        subject: emailSubject,
        html: emailHtml,
      });

      // Update last_birthday_wish_sent in Supabase single table
      await supabase
        .from("policyholders")
        .update({ last_birthday_wish_sent: new Date().toISOString() })
        .eq("id", person.id);

      sentCount++;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        celebrantsToday: birthdayPeople.length, 
        dispatched: sentCount 
      }), 
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Execution error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
