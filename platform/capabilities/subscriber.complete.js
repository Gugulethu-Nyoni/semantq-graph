/**
 * Subscriber Complete Capability
 * 
 * Marks the subscriber join workflow as complete.
 * Called after email dispatch.
 */

export function createSubscriberComplete() {
  return async function subscriberComplete(params, context, deps) {
    const subscriber = deps.create || deps.verify;

    return {
      success: true,
      message: 'Subscriber workflow complete',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        status: subscriber.status
      }
    };
  };
}
