import { Client, AgentProfile, EmailTemplate, EmailLog, ResendSettings } from '../types';
import { generateBirthdayEmailHtml } from '../utils/emailGenerator';

export interface SendEmailResult {
  success: boolean;
  resendId?: string;
  error?: string;
  simulated?: boolean;
}

/**
 * Sends a birthday greeting email using Resend API or Simulation Mode
 */
export async function sendBirthdayEmail(
  client: Client,
  agent: AgentProfile,
  template: EmailTemplate,
  config: ResendSettings
): Promise<SendEmailResult> {
  const { subject, html, text } = generateBirthdayEmailHtml(client, agent, template);

  // If in simulation mode or no API key, simulate realistic delivery
  if (config.simulation_mode || !config.api_key) {
    // Artificial slight delay for realistic network feeling
    await new Promise(r => setTimeout(r, 800));
    
    return {
      success: true,
      resendId: `sim_${Math.random().toString(36).substring(2, 11)}`,
      simulated: true,
    };
  }

  // Real Resend API dispatch
  try {
    const sender = config.sender_email && config.sender_email !== 'onboarding@resend.dev'
      ? (config.sender_name ? `${config.sender_name} <${config.sender_email}>` : config.sender_email)
      : 'Amulya Kumar Das & Sasmita Das <onboarding@jitus.tech>';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: [client.email],
        subject: subject,
        html: html,
        text: text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Resend Error: ${response.statusText}`,
      };
    }

    return {
      success: true,
      resendId: data.id,
      simulated: false,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error while contacting Resend API',
    };
  }
}

/**
 * Sends a test email to verify Resend setup
 */
export async function sendTestEmail(
  testRecipientEmail: string,
  agent: AgentProfile,
  config: ResendSettings
): Promise<SendEmailResult> {
  if (config.simulation_mode || !config.api_key) {
    await new Promise(r => setTimeout(r, 600));
    return {
      success: true,
      resendId: `sim_test_${Date.now()}`,
      simulated: true,
    };
  }

  try {
    const sender = config.sender_email && config.sender_email !== 'onboarding@resend.dev'
      ? `${config.sender_name || 'Postal Agent'} <${config.sender_email}>`
      : 'Amulya Kumar Das & Sasmita Das <onboarding@jitus.tech>';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: [testRecipientEmail],
        subject: `[Test] Postal Life Insurance Birthday Dispatch System Connected!`,
        html: `<div style="font-family: sans-serif; padding: 24px; color: #1e293b;">
          <h2 style="color: #d9232d;">📮 Resend Email Integration Verified!</h2>
          <p>Your Postal Life Insurance Birthday Auto-Notification System is successfully connected to Resend.</p>
          <p><strong>Configured Agent:</strong> ${agent.agent_name} (${agent.agency_code})</p>
          <p><strong>Sender:</strong> ${sender}</p>
          <p>You can now automate birthday greetings for all your policyholders.</p>
        </div>`,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Resend HTTP error ${response.status}`,
      };
    }

    return {
      success: true,
      resendId: data.id,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to send test email',
    };
  }
}
