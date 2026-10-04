/**
 * Subscriber Confirmed Capability
 * 
 * Marks the subscriber as confirmed after verification.
 * Called after subscriber.verify.
 */

export function createSubscriberConfirmed() {
  return async function subscriberConfirmed(params, context, deps) {
    const subscriber = deps.verify;

    return {
      success: true,
      message: 'Subscriber verified successfully',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        status: subscriber.status,
        verified_at: subscriber.verified_at
      }
    };
  };
}
