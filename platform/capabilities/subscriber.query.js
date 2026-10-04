/**
 * Subscriber Query Capability
 * 
 * Finds active/verified subscribers.
 * No email knowledge - just data retrieval.
 */

export function createSubscriberQuery(subscriberService) {
  return async function subscriberQuery(params, context) {
    const { status = 'verified' } = params;

    let subscribers;
    
    if (status === 'verified') {
      subscribers = await subscriberService.getVerified();
    } else {
      subscribers = await subscriberService.getAll(0, 1000, { status });
    }

    return {
      subscribers,
      count: subscribers.length,
      status
    };
  };
}
