/**
 * Delivery Complete Capability
 * 
 * Marks delivery as complete.
 */

export function createDeliveryComplete(deliveryService) {
  return async function completeDelivery(params, context, deps) {
    const delivery = deps.resolve;
    const sendResult = deps.send;
    
    if (sendResult && sendResult.messageId) {
      await deliveryService.markSent(delivery.id, sendResult.messageId);
    }
    
    return {
      success: true,
      delivery_id: delivery.id,
      message_id: sendResult?.messageId
    };
  };
}
