/**
 * Subscriber Create Capability
 * 
 * Creates a new subscriber in the database.
 * Called by the subscriber.join intent.
 */

export function createSubscriberCreate(subscriberService) {
  return async function subscriberCreate(params, context) {
    const { email, name, source } = params;

    if (!email) {
      throw new Error('Email is required');
    }

    const subscriber = await subscriberService.create({
      email,
      name: name || email.split('@')[0],
      source: source || 'website'
    });

    return {
      id: subscriber.id,
      email: subscriber.email,
      status: subscriber.status,
      verification_token: subscriber.verification_token,
      profile: subscriber.profile
    };
  };
}
