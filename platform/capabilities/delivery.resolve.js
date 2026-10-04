/**
 * Delivery Resolve Capability
 * 
 * Resolves a delivery by ID and includes the queue job payload.
 */

export function createDeliveryResolve(deliveryService, queueService) {
  return async function resolveDelivery(params, context, deps) {
    const { id } = params;
    
    if (!id) {
      throw new Error('Delivery ID is required');
    }
    
    const delivery = await deliveryService.getById(parseInt(id));
    
    if (!delivery) {
      throw new Error(`Delivery not found: ${id}`);
    }
    
    // Get the queue job to access the payload
    const jobId = delivery.queue_job_id;
    let payload = null;
    
    if (jobId) {
      const job = await queueService.getById(jobId);
      if (job) {
        payload = job.payload;
      }
    }
    
    return {
      ...delivery,
      payload: payload
    };
  };
}
