/**
 * Post Published Capability
 * 
 * Handles post publishing workflow with transactional safety.
 */

import { NewsletterRenderer } from '../renderers/NewsletterRenderer.js';

const renderer = new NewsletterRenderer();

export function createPostPublished(audienceResolver, deliveryService, queueService) {
  return async function postPublished(params, context, deps) {
    const post = deps.resolve;
    const publication = deps.publication || {};
    const config = context.config || {};
    
    // Resolve audience
    const audience = await audienceResolver({
      publication_id: post.publication_id
    }, context, deps);
    
    if (audience.count === 0) {
      return {
        success: true,
        message: 'No deliverable subscribers',
        queued: 0
      };
    }
    
    // Render newsletter HTML once with config
    const html = renderer.render(post, publication, config);
    
    // Use transactional create
    const result = await deliveryService.createDeliveriesForPost(
      post.id,
      audience.subscribers,
      queueService
    );
    
    // Store HTML in first job's payload for worker to use
    if (result.jobs.length > 0) {
      // Update first job payload with HTML
      const prisma = await import('../../lib/prisma.js').then(m => m.default);
      const client = await prisma();
      await client.queueJob.update({
        where: { id: result.jobs[0].id },
        data: {
          payload: {
            delivery_id: result.jobs[0].payload.delivery_id,
            post_id: post.id,
            subscriber_id: result.jobs[0].payload.subscriber_id,
            html: html
          }
        }
      });
    }
    
    return {
      success: true,
      message: `Queued ${result.deliveries.length} deliveries`,
      queued: result.deliveries.length,
      deliveries: result.deliveries.map(d => ({
        delivery_id: d.id,
        email: audience.subscribers.find(s => s.id === d.subscriber_id)?.email
      }))
    };
  };
}
