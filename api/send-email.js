import { Resend } from 'resend';

export default async function handler(req, res) {
  // Enable CORS for any origins just in case
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization || '';
    const bearerKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const apiKey = bearerKey || req.body?.api_key || process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: 'Resend API key is required' });
    }

    const { from, to, subject, html, text } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required email fields (to, subject, html)' });
    }

    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: from || 'Amulya Kumar Das & Sasmita Das <onboarding@jitus.tech>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    if (result.error) {
      return res.status(400).json({ error: result.error.message || result.error });
    }

    return res.status(200).json({ success: true, id: result.data?.id });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error while sending email' });
  }
}
