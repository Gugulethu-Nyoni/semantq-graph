/**
 * Entitlement Service
 * 
 * Business logic for entitlement management.
 */

import EntitlementModel from '../models/mysql/Entitlement.js';

class EntitlementService {
  async create(data) {
    return EntitlementModel.create(data);
  }

  async getById(id) {
    return EntitlementModel.findById(id);
  }

  async getBySubscriber(subscriberId) {
    return EntitlementModel.findBySubscriber(subscriberId);
  }

  async findByEntity(entityType, entityId, subscriberId) {
    return EntitlementModel.findByEntity(entityType, entityId, subscriberId);
  }

  async getBySubscription(subscriptionId) {
    return EntitlementModel.findBySubscription(subscriptionId);
  }

  async update(id, data) {
    return EntitlementModel.update(id, data);
  }

  async delete(id) {
    return EntitlementModel.delete(id);
  }

  async revoke(id) {
    return EntitlementModel.revoke(id);
  }
}

export default new EntitlementService();
