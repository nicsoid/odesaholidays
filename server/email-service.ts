import fs from 'fs';
import path from 'path';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // For development environment, save emails to file and log them
      const emailLog = {
        timestamp: new Date().toISOString(),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      // Save to emails.log file
      const logPath = path.join(process.cwd(), 'emails.log');
      const logEntry = `\n=== EMAIL SENT ${emailLog.timestamp} ===\n` +
                      `To: ${emailLog.to}\n` +
                      `Subject: ${emailLog.subject}\n` +
                      `Content: ${emailLog.text || emailLog.html.replace(/<[^>]*>/g, '')}\n` +
                      `==========================================\n`;
      
      fs.appendFileSync(logPath, logEntry);
      
      console.log(`📧 Email logged for: ${options.to}`);
      console.log(`📧 Subject: ${options.subject}`);
      
      return true;

    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset - Odesa Holiday Postcards</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; }
        .content { background: #f8fafc; padding: 30px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 14px; padding: 20px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reset Your Password</h1>
            <p>Odesa Holiday Postcards</p>
        </div>
        
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset the password for your Odesa Holiday Postcards account associated with this email address.</p>
            
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 3px; font-family: monospace;">
                ${resetUrl}
            </p>
            
            <div class="warning">
                <strong>Important:</strong> This password reset link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email or contact support if you have concerns.
            </div>
            
            <p>If you're having trouble with the button above, copy and paste the URL into your web browser.</p>
            
            <p>Best regards,<br>
            The Odesa Holiday Postcards Team</p>
        </div>
        
        <div class="footer">
            <p>© 2025 Odesa Holiday Postcards. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`;

    const text = `
Password Reset - Odesa Holiday Postcards

Hello,

We received a request to reset the password for your Odesa Holiday Postcards account.

Reset your password by visiting this link:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
The Odesa Holiday Postcards Team
`;

    return await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Odesa Holiday Postcards',
      html,
      text
    });
  }
}