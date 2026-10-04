/**
 * Access Resolver Capability
 * 
 * Determines if an actor can access content.
 * Hierarchy:
 * 1. Public → allow
 * 2. Direct Entitlement → allow
 * 3. Publication Entitlement → allow
 * 4. Active Subscription → allow
 * 5. Preview → allow (partial)
 * 6. Deny
 */

export function createAccessResolver(entitlementService, subscriptionService) {
  return async function resolveAccess(params, context, deps) {
    const { entity, actor } = params;
    
    // 1. Public content
    if (entity.access_level === 'public') {
      return {
        allowed: true,
        level: 'public'
      };
    }
    
    // If no actor, check if preview
    if (!actor || !actor.subscriber) {
      if (entity.access_level === 'preview' && entity.preview_length) {
        return {
          allowed: true,
          level: 'preview',
          preview_length: entity.preview_length
        };
      }
      return {
        allowed: false,
        reason: 'authentication_required',
        required: entity.access_level
      };
    }
    
    const subscriberId = actor.subscriber.id;
    
    // 2. Check direct entitlement
    const entitlement = await entitlementService.findByEntity({
      entity_type: 'post',
      entity_id: entity.id,
      subscriber_id: subscriberId
    });
    
    if (entitlement && (!entitlement.expires_at || entitlement.expires_at > new Date())) {
      return {
        allowed: true,
        level: entitlement.access_level,
        source: 'entitlement',
        expires_at: entitlement.expires_at
      };
    }
    
    // 3. Check publication entitlement (admin grants)
    if (entity.publication_id) {
      const publicationEntitlement = await entitlementService.findByEntity({
        entity_type: 'publication',
        entity_id: entity.publication_id,
        subscriber_id: subscriberId
      });
      
      if (publicationEntitlement && (!publicationEntitlement.expires_at || publicationEntitlement.expires_at > new Date())) {
        return {
          allowed: true,
          level: publicationEntitlement.access_level,
          source: 'publication_entitlement',
          expires_at: publicationEntitlement.expires_at
        };
      }
    }
    
    // 4. Check active subscription
    if (entity.publication_id) {
      const subscription = await subscriptionService.findActive({
        subscriber_id: subscriberId,
        publication_id: entity.publication_id
      });
      
      if (subscription && subscription.plan) {
        return {
          allowed: true,
          level: subscription.plan.access_level || 'member',
          source: 'subscription',
          expires_at: subscription.expires_at
        };
      }
    }
    
    // 5. Preview access
    if (entity.access_level === 'preview' && entity.preview_length) {
      return {
        allowed: true,
        level: 'preview',
        preview_length: entity.preview_length
      };
    }
    
    // 6. Deny
    return {
      allowed: false,
      reason: 'subscription_required',
      required: entity.access_level || 'member',
      preview_length: entity.preview_length || 0
    };
  };
}
