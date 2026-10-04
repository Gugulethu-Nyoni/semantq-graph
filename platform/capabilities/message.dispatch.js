/**
 * Message Dispatch Capability
 *
 * Framework does not know email, SMS, or push.
 * It knows: "A message needs to be dispatched"
 *
 * Platform decides: email, sms, push, webhook...
 *
 * CONTRACT:
 * - channel: 'email' | 'sms' | 'push' | 'webhook'
 * - recipient: { email, phone, userId, ... }
 * - payload: { subject, html, text, template, data }
 */

export function createMessageDispatch(channels) {
  return async function dispatchMessage(params, context) {
    console.log('[message.dispatch] Called with params:', JSON.stringify(params, null, 2));
    
    const {
      channel = 'email',
      recipient,
      payload = {}
    } = params;

    if (!recipient) {
      console.error('[message.dispatch] No recipient provided');
      throw new Error('Recipient is required for message.dispatch');
    }

    // Get the adapter for this channel
    const adapter = channels[channel];
    if (!adapter) {
      console.error('[message.dispatch] No adapter for channel:', channel);
      throw new Error(`No adapter registered for channel: ${channel}`);
    }

    console.log('[message.dispatch] Sending via', channel, 'to', recipient.email || recipient.phone);
    
    // Delegate to the channel adapter
    const result = await adapter.send({
      recipient,
      ...payload
    });
    
    console.log('[message.dispatch] Result:', result);
    return result;
  };
}
