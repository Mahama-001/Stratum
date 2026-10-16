import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { logAuditEvent } from './db.ts';

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  previewCode?: string;
  deliveredTo: string;
  error?: string;
}

/**
 * Generates a secure 6-digit numeric verification code.
 */
export function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generates an institutional, responsive Apple Pro styled HTML email template.
 */
export function renderVerificationEmailHtml(code: string, name?: string | null): string {
  const greeting = name ? `Hello ${name},` : 'Hello Trader,';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stratum Verification Code</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', 'Inter', Helvetica, Arial, sans-serif;
      background-color: #08090c;
      color: #f5f5f7;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background: #121318;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
    }
    .header {
      padding: 32px 32px 24px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%);
    }
    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 12px;
      background: rgba(0, 113, 227, 0.18);
      color: #2997ff;
      border: 1px solid rgba(41, 151, 255, 0.35);
      margin-bottom: 16px;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin: 0;
    }
    .content {
      padding: 32px;
      text-align: center;
    }
    .greeting {
      font-size: 15px;
      color: #d1d1d6;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .code-box {
      margin: 28px 0;
      padding: 24px;
      background: #08090c;
      border: 1px solid rgba(41, 151, 255, 0.3);
      border-radius: 18px;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
    }
    .code {
      font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #2997ff;
      text-shadow: 0 0 20px rgba(41, 151, 255, 0.4);
    }
    .expiry {
      font-size: 13px;
      color: #a1a1a6;
      margin-top: 14px;
    }
    .warning {
      font-size: 12px;
      color: #8e8e93;
      line-height: 1.6;
      padding: 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      margin-top: 24px;
    }
    .footer {
      padding: 20px 32px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 11px;
      color: #6e6e73;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Institutional Security</div>
      <h1 class="title">Verify Your Stratum Account</h1>
    </div>
    <div class="content">
      <p class="greeting">${greeting}<br>Welcome to Stratum. Enter the 6-digit confirmation code below to activate your trading terminal access.</p>
      
      <div class="code-box">
        <div class="code">${code}</div>
        <div class="expiry">Expires in 10 minutes</div>
      </div>

      <div class="warning">
        If you did not request this verification code, you can safely ignore this email. Never share this code with anyone.
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Stratum Enterprise Risk Operating System. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generates an institutional HTML email template for password resets.
 */
export function renderPasswordResetEmailHtml(code: string, name?: string | null): string {
  const greeting = name ? `Hello ${name},` : 'Hello Trader,';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Stratum Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', 'Inter', Helvetica, Arial, sans-serif;
      background-color: #08090c;
      color: #f5f5f7;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background: #121318;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
    }
    .header {
      padding: 32px 32px 24px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%);
    }
    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 12px;
      background: rgba(255, 69, 58, 0.18);
      color: #ff453a;
      border: 1px solid rgba(255, 69, 58, 0.35);
      margin-bottom: 16px;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin: 0;
    }
    .content {
      padding: 32px;
      text-align: center;
    }
    .greeting {
      font-size: 15px;
      color: #d1d1d6;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .code-box {
      margin: 28px 0;
      padding: 24px;
      background: #08090c;
      border: 1px solid rgba(255, 69, 58, 0.35);
      border-radius: 18px;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
    }
    .code {
      font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #ff453a;
      text-shadow: 0 0 20px rgba(255, 69, 58, 0.4);
    }
    .expiry {
      font-size: 13px;
      color: #a1a1a6;
      margin-top: 14px;
    }
    .warning {
      font-size: 12px;
      color: #8e8e93;
      line-height: 1.6;
      padding: 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      margin-top: 24px;
    }
    .footer {
      padding: 20px 32px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 11px;
      color: #6e6e73;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Security Alert</div>
      <h1 class="title">Password Reset Request</h1>
    </div>
    <div class="content">
      <p class="greeting">${greeting}<br>A request was received to reset your Stratum trader password. Enter the 6-digit security code below to proceed.</p>
      
      <div class="code-box">
        <div class="code">${code}</div>
        <div class="expiry">Expires in 10 minutes</div>
      </div>

      <div class="warning">
        If you did not initiate this request, your account may be at risk. Contact your prop firm administrator or change your password immediately.
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Stratum Enterprise Risk Operating System. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generates an institutional HTML email template for 2FA login verification.
 */
export function renderTwoFactorEmailHtml(code: string, name?: string | null): string {
  const greeting = name ? `Hello ${name},` : 'Hello Trader,';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stratum Two-Factor Authentication</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', 'Inter', Helvetica, Arial, sans-serif;
      background-color: #08090c;
      color: #f5f5f7;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background: #121318;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
    }
    .header {
      padding: 32px 32px 24px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%);
    }
    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 12px;
      background: rgba(48, 209, 88, 0.18);
      color: #30d158;
      border: 1px solid rgba(48, 209, 88, 0.35);
      margin-bottom: 16px;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin: 0;
    }
    .content {
      padding: 32px;
      text-align: center;
    }
    .greeting {
      font-size: 15px;
      color: #d1d1d6;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .code-box {
      margin: 28px 0;
      padding: 24px;
      background: #08090c;
      border: 1px solid rgba(48, 209, 88, 0.35);
      border-radius: 18px;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
    }
    .code {
      font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #30d158;
      text-shadow: 0 0 20px rgba(48, 209, 88, 0.4);
    }
    .expiry {
      font-size: 13px;
      color: #a1a1a6;
      margin-top: 14px;
    }
    .warning {
      font-size: 12px;
      color: #8e8e93;
      line-height: 1.6;
      padding: 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      margin-top: 24px;
    }
    .footer {
      padding: 20px 32px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 11px;
      color: #6e6e73;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Two-Factor Authentication</div>
      <h1 class="title">Sign-in Verification Code</h1>
    </div>
    <div class="content">
      <p class="greeting">${greeting}<br>Enter the 6-digit one-time passkey below to complete your sign in to Stratum Institutional.</p>
      
      <div class="code-box">
        <div class="code">${code}</div>
        <div class="expiry">Expires in 5 minutes</div>
      </div>

      <div class="warning">
        If you did not attempt to sign in, someone may know your password. Change your credentials immediately.
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Stratum Enterprise Risk Operating System. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Universal internal dispatcher supporting Gmail SMTP, Resend, and local simulation.
 */
async function executeEmailDispatch(params: {
  email: string;
  code: string;
  subject: string;
  html: string;
  auditAction: string;
  auditDetails: string;
}): Promise<EmailSendResult> {
  const cleanEmail = params.email.trim().toLowerCase();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  // Log audit event
  logAuditEvent(params.auditAction, cleanEmail, params.auditDetails);

  // 1. SMTP / Gmail Delivery
  if (smtpUser && smtpPass) {
    try {
      const host = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
      const port = Number(process.env.SMTP_PORT) || 465;
      const secure = port === 465;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user: smtpUser, pass: smtpPass },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `Stratum Security <${smtpUser}>`,
        to: cleanEmail,
        subject: params.subject,
        html: params.html,
      });

      console.log(`[SMTP Dispatch Successful] ID: ${info.messageId} -> ${cleanEmail}`);
      return {
        success: true,
        messageId: info.messageId,
        deliveredTo: cleanEmail,
        previewCode: undefined,
      };
    } catch (err) {
      console.error('[SMTP Dispatch Error]', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to send email via SMTP.',
        deliveredTo: cleanEmail,
      };
    }
  }

  // 2. Resend API Delivery
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Stratum Security <onboarding@resend.dev>',
          to: [cleanEmail],
          subject: params.subject,
          html: params.html,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[Resend Dispatch Successful] ID: ${data.id} -> ${cleanEmail}`);
        return {
          success: true,
          messageId: data.id,
          deliveredTo: cleanEmail,
          previewCode: undefined,
        };
      } else {
        const errData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
        const errMsg = typeof errData.message === 'string' ? errData.message : `Resend returned status ${response.status}`;
        console.error('[Resend Dispatch Error]', response.status, errMsg);
        return {
          success: false,
          error: errMsg,
          deliveredTo: cleanEmail,
        };
      }
    } catch (err) {
      console.error('Failed to dispatch email via Resend API:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error connecting to Resend API.',
        deliveredTo: cleanEmail,
      };
    }
  }

  // 3. Local Simulation Fallback
  console.log(`\n======================================================`);
  console.log(`[STRATUM EMAIL DISPATCHER] (Simulation Mode - No Credentials Set)`);
  console.log(`To: ${cleanEmail}`);
  console.log(`Subject: ${params.subject}`);
  console.log(`Security Code: >>> ${params.code} <<<`);
  console.log(`======================================================\n`);

  return {
    success: true,
    messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    deliveredTo: cleanEmail,
    previewCode: params.code,
  };
}

/**
 * Dispatches account signup verification email.
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  name?: string | null
): Promise<EmailSendResult> {
  return executeEmailDispatch({
    email,
    code,
    subject: `${code} is your Stratum verification code`,
    html: renderVerificationEmailHtml(code, name),
    auditAction: 'VERIFICATION_CODE_GENERATED',
    auditDetails: 'Verification code dispatched for trader registration.',
  });
}

/**
 * Dispatches password reset code email.
 */
export async function sendPasswordResetEmail(
  email: string,
  code: string,
  name?: string | null
): Promise<EmailSendResult> {
  return executeEmailDispatch({
    email,
    code,
    subject: `${code} is your Stratum password reset code`,
    html: renderPasswordResetEmailHtml(code, name),
    auditAction: 'PASSWORD_RESET_REQUESTED',
    auditDetails: 'Password reset code dispatched.',
  });
}

/**
 * Dispatches two-factor authentication login code email.
 */
export async function sendTwoFactorEmail(
  email: string,
  code: string,
  name?: string | null
): Promise<EmailSendResult> {
  return executeEmailDispatch({
    email,
    code,
    subject: `${code} is your Stratum 2FA login code`,
    html: renderTwoFactorEmailHtml(code, name),
    auditAction: '2FA_CHALLENGE_GENERATED',
    auditDetails: 'Two-factor authentication code dispatched for login.',
  });
}



