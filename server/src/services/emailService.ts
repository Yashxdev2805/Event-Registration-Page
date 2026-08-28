import dotenv from 'dotenv';
dotenv.config();

// Brevo Transactional Email Service
export interface SendEmailPayload {
  toEmail: string;
  toName: string;
  referenceId: string;
  teamName: string;
  trackLabel: string;
  teamSize: string;
}

export class EmailService {
  private apiKey: string;
  private senderEmail: string;
  private senderName: string;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY || '';
    this.senderEmail = process.env.SENDER_EMAIL || 'ecell@uietkuk.ac.in';
    this.senderName = process.env.SENDER_NAME || 'E-Cell UIET KUK';
  }

  public async sendConfirmationEmail(payload: SendEmailPayload): Promise<boolean> {
    if (!this.apiKey || !this.apiKey.startsWith('xkeysib-')) {
      console.log(`📧 [EmailService] Simulated email to ${payload.toEmail} (Reference ID: ${payload.referenceId})`);
      return true;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 32px 24px; }
    .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .ref-badge { display: inline-block; background-color: #f59e0b; color: #0b0f19; font-weight: 800; font-family: monospace; font-size: 18px; padding: 8px 16px; border-radius: 8px; margin: 12px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
    .label { color: #94a3b8; }
    .val { font-weight: 600; color: #f8fafc; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 E-CELL PITCH ARENA 2026</h1>
      <p>Official Startup Registration Confirmation</p>
    </div>
    <div class="content">
      <h2>Congratulations, ${payload.toName}!</h2>
      <p>Your team <strong>${payload.teamName}</strong> has been successfully registered for the <strong>E-Cell UIET KUK Pitch Arena 2026</strong> competition.</p>
      
      <div class="card" style="text-align: center;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Your Official Reference Docket ID</div>
        <div class="ref-badge">${payload.referenceId}</div>
        <p style="font-size: 12px; color: #cbd5e1; margin: 0;">Please keep this Reference ID handy for check-in and pitch slot allocation.</p>
      </div>

      <div class="card">
        <div class="row"><span class="label">Team Name:</span><span class="val">${payload.teamName}</span></div>
        <div class="row"><span class="label">Competition Track:</span><span class="val">${payload.trackLabel}</span></div>
        <div class="row"><span class="label">Team Size:</span><span class="val">${payload.teamSize} Member(s)</span></div>
        <div class="row" style="border-bottom: none;"><span class="label">Lead Founder Email:</span><span class="val">${payload.toEmail}</span></div>
      </div>

      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
        Next steps: The judging panel will review all submissions. Shortlisted teams will receive stage presentation schedules via this email.
      </p>
    </div>
    <div class="footer">
      © 2026 Entrepreneurship Cell (E-Cell), UIET, Kurukshetra University.<br>
      This is an automated system confirmation.
    </div>
  </div>
</body>
</html>
    `;

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { name: this.senderName, email: this.senderEmail },
          to: [{ email: payload.toEmail, name: payload.toName }],
          subject: `🚀 Registration Confirmed: ${payload.teamName} [Ref: ${payload.referenceId}]`,
          htmlContent,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ [Brevo] API Error Response:', response.status, errorBody);
        return false;
      }

      console.log(`✉️ [Brevo] Confirmation email sent successfully to ${payload.toEmail} (Ref: ${payload.referenceId})`);
      return true;
    } catch (error) {
      console.error('❌ [Brevo] Network error dispatching email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
