/**
 * Subscriber Verify Capability
 * 
 * Verifies a subscriber using their verification token.
 * Called by the subscriber.confirm intent.
 */

export function createSubscriberVerify(subscriberService) {
  return async function subscriberVerify(params, context) {
    const { token } = params;

    if (!token) {
      throw new Error('Verification token is required');
    }

    const subscriber = await subscriberService.verify(token);

    return {
      id: subscriber.id,
      email: subscriber.email,
      status: subscriber.status,
      verified_at: subscriber.verified_at
    };
  };
}
