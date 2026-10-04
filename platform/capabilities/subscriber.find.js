/**
 * Subscriber Find Capability
 * 
 * Finds a subscriber by email.
 */

export function createSubscriberFind(subscriberService) {
  return async function subscriberFind(params, context) {
    const { email } = params;

    if (!email) {
      throw new Error('Email is required');
    }

    const subscriber = await subscriberService.findByEmail(email);

    if (!subscriber) {
      throw new Error('Subscriber not found');
    }

    return subscriber;
  };
}
