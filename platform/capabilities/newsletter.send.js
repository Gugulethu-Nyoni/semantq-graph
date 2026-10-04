/**
 * Newsletter Send Capability
 * 
 * Sends a newsletter to subscribers.
 */

import { NewsletterRenderer } from '../renderers/NewsletterRenderer.js';

const renderer = new NewsletterRenderer();

export function createNewsletterSend(messageDispatch, config = {}) {
  return async function newsletterSend(params, context) {
    console.log('[newsletter.send] Called with params keys:', Object.keys(params));
    console.log('[newsletter.send] Has post:', !!params.post);
    console.log('[newsletter.send] Has subscribers:', !!params.subscribers);
    
    // Get post and subscribers from params
    const post = params.post;
    let subscribers = params.subscribers;
    
    // If subscribers is an object with a subscribers property, unwrap it
    if (subscribers && typeof subscribers === 'object' && subscribers.subscribers) {
      subscribers = subscribers.subscribers;
    }
    
    // Ensure subscribers is an array
    if (!Array.isArray(subscribers)) {
      subscribers = [];
    }
    
    console.log('[newsletter.send] Post ID:', post?.id);
    console.log('[newsletter.send] Subscribers count:', subscribers.length);
    
    if (!post) {
      console.error('[newsletter.send] No post found');
      return {
        success: false,
        error: 'Post is required',
        sent: 0
      };
    }

    if (subscribers.length === 0) {
      console.log('[newsletter.send] No subscribers to notify');
      return {
        success: true,
        message: 'No subscribers to notify',
        sent: 0
      };
    }

    // Render newsletter HTML once
    const html = renderer.render(post, config);
    console.log('[newsletter.send] HTML rendered, length:', html?.length || 0);

    // Send to each subscriber
    const results = [];
    for (const subscriber of subscribers) {
      try {
        const email = subscriber.email;
        const name = subscriber?.profile?.first_name || 'Subscriber';
        
        console.log('[newsletter.send] Sending to:', email);
        
        // Create delivery record
        const deliveryService = (await import('../../services/DeliveryService.js')).default;
        const delivery = await deliveryService.create({
          content_type: 'post',
          content_id: post.id,
          channel: 'email',
          subscriber_id: subscriber.id,
          status: 'pending'
        });
        
        console.log('[newsletter.send] Created delivery:', delivery.id);
        
        // Send email via messageDispatch
        if (messageDispatch) {
          const result = await messageDispatch({
            channel: 'email',
            recipient: {
              email: email,
              name: name
            },
            payload: {
              subject: `New post: ${post.title}`,
              html: html.replace(/{{email}}/g, email)
            }
          });
          
          console.log('[newsletter.send] Sent to:', email, 'result:', result);
          
          // Update delivery with sent status
          if (result?.messageId) {
            await deliveryService.markSent(delivery.id, result.messageId);
          }
        }
        
        results.push({
          email: email,
          success: true,
          deliveryId: delivery.id
        });
      } catch (err) {
        console.error('[newsletter.send] Failed for', subscriber?.email, ':', err.message);
        results.push({
          email: subscriber?.email || 'unknown',
          success: false,
          error: err.message
        });
      }
    }

    return {
      success: true,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  };
}
