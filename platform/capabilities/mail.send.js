/**
 * Mail Send Capability
 * 
 * Sends email using the mail service.
 */

import subscriberMail from '../../services/Subscriber.js';

export function createMailSender() {
  return async function sendMail(params, context, deps) {
    const emailData = deps.render;
    
    if (!emailData) {
      throw new Error('Email data is required');
    }
    
    await subscriberMail.init();
    
    const result = await subscriberMail.sendSubscriber({
      recipients: [emailData.recipient.email],
      subject: emailData.subject,
      template: 'subscriber/subscriber',
      recipient: emailData.recipient,
      html: emailData.html
    });
    
    return {
      sent: true,
      messageId: result?.messageId
    };
  };
}
