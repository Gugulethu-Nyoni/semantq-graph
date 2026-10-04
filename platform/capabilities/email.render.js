/**
 * Email Render Capability
 *
 * Renders email HTML from either a manifest or a delivery payload.
 * Supports both workflow types:
 * - post.email: uses manifest
 * - delivery.send: uses delivery payload
 */

import blogNotification from '../../services/BlogNotification.js';

export function createEmailRender() {
  return async function emailRender(params, context, deps) {
    // Try to get data from manifest or delivery
    let data, meta;
    
    if (deps.manifest) {
      // Case 1: Called from post.email workflow
      const manifest = deps.manifest;
      if (!manifest.data) {
        throw new Error('Manifest data required for email.render');
      }
      data = manifest.data;
      meta = manifest.meta || {};
    } else if (deps.resolve) {
      // Case 2: Called from delivery.send workflow
      const delivery = deps.resolve;
      if (!delivery || !delivery.payload) {
        throw new Error('Delivery payload required for email.render');
      }
      
      // Extract from delivery payload
      const payload = delivery.payload;
      const subscriber = delivery.subscriber || {};
      
      // Build data from delivery payload
      data = {
        title: payload.title || 'New Post',
        content: payload.html || '',
        excerpt: payload.excerpt || '',
        author: payload.author || null,
        url: payload.url || ''
      };
      
      meta = {
        recipients: [subscriber.email || 'gugunnn@gmail.com'],
        recipientName: subscriber?.profile?.first_name || 'Subscriber',
        title: payload.title || 'New Post'
      };
    } else {
      throw new Error('Manifest or delivery required for email.render');
    }

    // Initialize the mail service
    await blogNotification.init();

    // Build the email payload
    const payload = {
      recipients: meta.recipients || ['gugunnn@gmail.com'],
      subject: meta.title || data.title || 'New Post',
      template: 'blognotification/blognotification',
      recipient: {
        email: meta.recipients?.[0] || 'gugunnn@gmail.com',
        name: meta.recipientName || 'Subscriber'
      },
      html: data.content || `
        <h1>${data.title}</h1>
        <p>${data.excerpt || ''}</p>
        <a href="${data.url || 'https://example.com'}">Read full post</a>
      `,
      templateData: {
        title: data.title,
        excerpt: data.excerpt,
        author: data.author?.name,
        url: data.url
      }
    };

    // Send using the generated service
    const result = await blogNotification.sendBlogNotification(payload);

    return {
      success: true,
      messageId: result.messageId,
      recipients: payload.recipients
    };
  };
}
