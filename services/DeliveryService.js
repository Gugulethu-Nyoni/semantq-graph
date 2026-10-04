/**
 * Delivery Service
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class DeliveryService {
  async create(data) {
    console.log('[DeliveryService] Creating delivery:', data);
    return await prisma.contentDelivery.create({
      data: {
        content_type: data.content_type,
        content_id: data.content_id,
        channel: data.channel || 'email',
        subscriber_id: data.subscriber_id,
        status: data.status || 'pending'
      }
    });
  }

  async markSent(id, messageId) {
    console.log('[DeliveryService] Marking delivery as sent:', id);
    return await prisma.contentDelivery.update({
      where: { id },
      data: {
        status: 'sent',
        sent_at: new Date(),
        provider_message_id: messageId
      }
    });
  }

  async markFailed(id, error) {
    console.log('[DeliveryService] Marking delivery as failed:', id);
    return await prisma.contentDelivery.update({
      where: { id },
      data: {
        status: 'failed',
        error: error
      }
    });
  }

  async getById(id) {
    return await prisma.contentDelivery.findUnique({
      where: { id },
      include: { subscriber: true }
    });
  }

  async getBySubscriber(subscriberId) {
    return await prisma.contentDelivery.findMany({
      where: { subscriber_id: subscriberId },
      orderBy: { created_at: 'desc' }
    });
  }
}

export default new DeliveryService();
