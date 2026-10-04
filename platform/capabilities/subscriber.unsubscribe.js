/**
 * Subscriber Unsubscribe Capability
 * 
 * Unsubscribes a subscriber by email.
 */

export function createSubscriberUnsubscribe(subscriberService) {
  return async function subscriberUnsubscribe(params, context, deps) {
    const subscriber = deps.find;

    if (!subscriber) {
      throw new Error('Subscriber not found');
    }

    const result = await subscriberService.unsubscribe(subscriber.email);

    return result;
  };
}
