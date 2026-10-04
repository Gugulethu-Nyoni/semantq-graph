/**
 * Delivery Send Capability
 * 
 * Sends a delivery email using mail.send
 */

export function createDeliverySend() {
  return async function deliverySend(params, context) {
    console.log('[delivery.send] Called with params:', JSON.stringify(params, null, 2));
    console.log('[delivery.send] Context keys:', Object.keys(context || {}));
    
    // The delivery should come from the resolve node or params
    const delivery = params.delivery || params;
    
    if (!delivery || !delivery.id) {
      console.error('[delivery.send] No delivery found');
      return { success: false, error: 'Delivery not found' };
    }
    
    // Get subscriber from the delivery or params
    const subscriber = delivery.subscriber || params.subscriber;
    if (!subscriber || !subscriber.email) {
      console.error('[delivery.send] No subscriber with email found');
      return { success: false, error: 'Subscriber email not found' };
    }
    
    // Get the HTML content
    let html = delivery.html || params.html || delivery.payload?.html;
    if (!html) {
      console.warn('[delivery.send] No HTML found, using fallback');
      html = `<h1>New Post</h1><p>Check your feed for the latest post.</p>`;
    }
    
    console.log('[delivery.send] Sending email to:', subscriber.email);
    
    // Try to get mail.send capability from context
    let mailSend;
    try {
      const mailSendModule = await import('./mail.send.js');
      mailSend = mailSendModule.createMailSender();
    } catch (error) {
      console.warn('[delivery.send] Could not load mail.send, using fallback');
      // Fallback: just log the email
      console.log('[delivery.send] [FALLBACK] Would send email to:', subscriber.email);
      console.log('[delivery.send] [FALLBACK] Subject:', delivery.subject || 'New post available');
      console.log('[delivery.send] [FALLBACK] HTML length:', html.length);
      
      return {
        success: true,
        messageId: `fallback-${Date.now()}`,
        deliveryId: delivery.id,
        subscriberId: subscriber.id,
        note: 'Email logged (mail.send not available)'
      };
    }
    
    // Send the email
    const result = await mailSend({
      to: subscriber.email,
      subject: delivery.subject || 'New post available',
      html: html,
      from: context.config?.emailFrom || 'noreply@example.com'
    }, context);
    
    console.log('[delivery.send] Email sent, messageId:', result?.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      deliveryId: delivery.id,
      subscriberId: subscriber.id
    };
  };
}
