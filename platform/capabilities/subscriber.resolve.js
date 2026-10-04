/**
 * Subscriber Resolve Capability
 * 
 * Resolves a subscriber by ID.
 */

export function createSubscriberResolve(subscriberService) {
  return async function resolveSubscriber(params, context, deps) {
    const delivery = deps.resolve;
    
    if (!delivery || !delivery.subscriber_id) {
      throw new Error('Subscriber ID not found in delivery');
    }
    
    const subscriber = await subscriberService.getById(delivery.subscriber_id);
    
    if (!subscriber) {
      throw new Error(`Subscriber not found: ${delivery.subscriber_id}`);
    }
    
    return subscriber;
  };
}
