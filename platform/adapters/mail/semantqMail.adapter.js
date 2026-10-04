/**
 * Semantq Mail Adapter
 *
 * Uses @semantq/mail from packages directory.
 * Consistent with other Semantq modules.
 */

// Import from packages directory
import { MailService } from '../../../packages/@semantq/mail/index.js';

class SemantqMailAdapter {
  constructor() {
    this.mail = new MailService();
  }

  async send(payload) {
    const { recipient, subject, html, text, template, data } = payload;

    const emailPayload = {
      recipients: recipient?.email ? [recipient.email] : ['gugunnn@gmail.com'],
      subject: subject || 'Message from Semantq',
      template: template || 'default',
      recipient: recipient || { email: 'gugunnn@gmail.com' },
      text: text || '',
      html: html || '',
      templateData: data || {}
    };

    const result = await this.mail.send(emailPayload);

    return {
      success: result.success || true,
      messageId: result.messageId || `msg_${Date.now()}`,
      recipients: emailPayload.recipients
    };
  }
}

export default new SemantqMailAdapter();
