/**
 * Audience Resolver Capability
 * 
 * Finds deliverable subscribers for a post's publication.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function createAudienceResolver(subscriptionService) {
  return async function resolveAudience(params, context) {
    console.log('[audience.resolve] Called with params:', JSON.stringify(params, null, 2));
    console.log('[audience.resolve] subscriptionService exists:', !!subscriptionService);
    
    // Get post from params
    const post = params.post || params.resolve?.result;
    
    console.log('[audience.resolve] Post:', post ? { id: post.id, publication_id: post.publication_id } : null);
    
    if (!post) {
      console.error('[audience.resolve] No post found in params');
      return { subscribers: [] };
    }
    
    const publicationId = post.publication_id || params.publication_id;
    
    if (!publicationId) {
      console.error('[audience.resolve] No publication_id found');
      return { subscribers: [] };
    }
    
    console.log('[audience.resolve] Finding subscribers for publication:', publicationId);
    
    try {
      let subscribers = [];
      
      // Try using subscriptionService first
      if (subscriptionService) {
        try {
          if (typeof subscriptionService.getByPublication === 'function') {
            console.log('[audience.resolve] Using subscriptionService.getByPublication');
            const subscriptions = await subscriptionService.getByPublication(publicationId, 'active');
            if (subscriptions && subscriptions.length > 0) {
              subscribers = subscriptions
                .filter(s => s.subscriber?.status === 'verified')
                .map(s => s.subscriber)
                .filter(Boolean);
            }
          } else if (typeof subscriptionService.findSubscribersByPublication === 'function') {
            console.log('[audience.resolve] Using subscriptionService.findSubscribersByPublication');
            subscribers = await subscriptionService.findSubscribersByPublication(publicationId);
            subscribers = subscribers.filter(s => s.status === 'verified');
          } else {
            console.warn('[audience.resolve] Subscription service has no query methods');
          }
        } catch (serviceError) {
          console.error('[audience.resolve] Service error:', serviceError.message);
          // Fall through to Prisma fallback
        }
      }
      
      // ✅ FALLBACK: Direct Prisma query (guaranteed to work)
      if (!subscribers || subscribers.length === 0) {
        console.log('[audience.resolve] Using Prisma fallback query');
        
        const subscriptions = await prisma.subscription.findMany({
          where: {
            publication_id: publicationId,
            status: 'active',
            subscriber: {
              status: 'verified'
            }
          },
          include: {
            subscriber: {
              include: {
                profile: true
              }
            }
          }
        });
        
        subscribers = subscriptions.map(s => s.subscriber).filter(Boolean);
        console.log('[audience.resolve] Prisma fallback found', subscribers.length, 'subscribers');
      }
      
      console.log('[audience.resolve] Final subscribers count:', subscribers.length);
      if (subscribers.length > 0) {
        console.log('[audience.resolve] Emails:', subscribers.map(s => s.email).join(', '));
      }
      
      return { 
        subscribers: Array.isArray(subscribers) ? subscribers : [] 
      };
    } catch (error) {
      console.error('[audience.resolve] Error:', error.message);
      console.error('[audience.resolve] Stack:', error.stack);
      return { subscribers: [] };
    }
  };
}
