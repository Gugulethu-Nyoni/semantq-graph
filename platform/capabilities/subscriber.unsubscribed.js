/**
 * Subscriber Unsubscribed Capability
 * 
 * Marks the unsubscribe workflow as complete.
 */

export function createSubscriberUnsubscribed() {
  return async function subscriberUnsubscribed(params, context, deps) {
    const subscriber = deps.unsubscribe;

    return {
      success: true,
      message: 'Unsubscribed successfully',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        status: subscriber.status
      }
    };
  };
}
