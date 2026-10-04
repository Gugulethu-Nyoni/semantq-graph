/**
 * Real Mail Adapter
 * 
 * Sends real emails using Nodemailer.
 * For testing with gugunnn@gmail.com
 */

import nodemailer from 'nodemailer';

class RealMailAdapter {
  constructor() {
    // Configure your email transport
    // For Gmail, you'll need an App Password
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
      }
    });
  }

  async send(payload) {
    const { recipient, subject, html, text } = payload;

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@semantq.com',
      to: recipient.email || 'gugunnn@gmail.com',
      subject: subject || 'New Post from Semantq',
      html: html || `
        <h1>Hello from Semantq!</h1>
        <p>This is a test email from the Semantq email pipeline.</p>
        <p>Your blog post is ready: <a href="https://example.com/blog/hello-world">Read it here</a></p>
        <hr>
        <p style="color: #666; font-size: 12px;">Sent via Semantq Runtime</p>
      `,
      text: text || 'Hello from Semantq!\n\nThis is a test email from the Semantq email pipeline.\n\nYour blog post is ready: https://example.com/blog/hello-world'
    };

    const info = await this.transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    console.log(`   To: ${mailOptions.to}`);
    console.log(`   Subject: ${mailOptions.subject}`);

    return {
      success: true,
      messageId: info.messageId,
      recipients: [mailOptions.to]
    };
  }
}

export default new RealMailAdapter();
