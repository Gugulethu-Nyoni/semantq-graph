/**
 * Subscription Service
 * 
 * Handles subscription queries for the audience resolver
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SubscriptionService {
  constructor() {
    this.prisma = prisma;
  }

  /**
   * Get active subscriptions by publication ID
   */
  async getByPublication(publicationId, status = 'active') {
    console.log('[SubscriptionService] getByPublication called with:', { publicationId, status });
    
    try {
      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          publication_id: publicationId,
          status: status
        },
        include: {
          subscriber: {
            include: {
              profile: true
            }
          }
        }
      });
      
      console.log('[SubscriptionService] Found', subscriptions.length, 'subscriptions');
      return subscriptions;
    } catch (error) {
      console.error('[SubscriptionService] Error:', error.message);
      return [];
    }
  }

  /**
   * Find verified subscribers by publication ID
   */
  async findSubscribersByPublication(publicationId) {
    console.log('[SubscriptionService] findSubscribersByPublication called with:', { publicationId });
    
    try {
      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          publication_id: publicationId,
          status: 'active',
          subscriber: {
            status: 'verified'
          }
        },
        include: {
          subscriber: {
            include: {
              profile: true
            }
          }
        }
      });
      
      const subscribers = subscriptions.map(s => s.subscriber).filter(Boolean);
      console.log('[SubscriptionService] Found', subscribers.length, 'verified subscribers');
      return subscribers;
    } catch (error) {
      console.error('[SubscriptionService] Error:', error.message);
      return [];
    }
  }

  /**
   * Get subscription by ID
   */
  async getById(id) {
    try {
      return await this.prisma.subscription.findUnique({
        where: { id },
        include: {
          subscriber: {
            include: {
              profile: true
            }
          }
        }
      });
    } catch (error) {
      console.error('[SubscriptionService] Error getting subscription:', error.message);
      return null;
    }
  }

  /**
   * Create a subscription
   */
  async create(data) {
    try {
      return await this.prisma.subscription.create({
        data: {
          subscriber_id: data.subscriber_id,
          publication_id: data.publication_id,
          status: data.status || 'active',
          plan_id: data.plan_id || null,
          expires_at: data.expires_at || null
        },
        include: {
          subscriber: {
            include: {
              profile: true
            }
          }
        }
      });
    } catch (error) {
      console.error('[SubscriptionService] Error creating subscription:', error.message);
      throw error;
    }
  }

  /**
   * Update a subscription
   */
  async update(id, data) {
    try {
      return await this.prisma.subscription.update({
        where: { id },
        data,
        include: {
          subscriber: {
            include: {
              profile: true
            }
          }
        }
      });
    } catch (error) {
      console.error('[SubscriptionService] Error updating subscription:', error.message);
      throw error;
    }
  }

  /**
   * Delete a subscription
   */
  async delete(id) {
    try {
      return await this.prisma.subscription.delete({
        where: { id }
      });
    } catch (error) {
      console.error('[SubscriptionService] Error deleting subscription:', error.message);
      throw error;
    }
  }
}

export default new SubscriptionService();
