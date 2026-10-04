/**
 * Subscriber Service
 * 
 * Business logic for subscriber management.
 */

import SubscriberModel from '../models/mysql/Subscriber.js';

class SubscriberService {
  async create(data) {
    const existing = await SubscriberModel.findByEmail(data.email);

    if (existing) {
      if (existing.status === 'verified') {
        throw new Error('Already subscribed');
      }
      return existing;
    }

    return SubscriberModel.create({
      email: data.email,
      source: data.source || 'website',
      profile: data.name ? {
        first_name: data.name
      } : undefined,
      preferences: {
        newsletter: true,
        comments: true,
        product_updates: false
      }
    });
  }

  async findById(id) {
    return SubscriberModel.findById(id);
  }

  async findByEmail(email) {
    return SubscriberModel.findByEmail(email);
  }

  async findByToken(token) {
    return SubscriberModel.findByToken(token);
  }

  async getVerified() {
    return SubscriberModel.getVerified();
  }

  async getAll(skip = 0, take = 10, where = {}) {
    return SubscriberModel.findWithPagination(skip, take, where);
  }

  async count(where = {}) {
    return SubscriberModel.count(where);
  }

  async update(id, data) {
    return SubscriberModel.update(id, data);
  }

  async verify(token) {
    const subscriber = await SubscriberModel.findByToken(token);
    if (!subscriber) {
      throw new Error('Invalid verification token');
    }
    if (subscriber.status === 'verified') {
      throw new Error('Already verified');
    }
    return SubscriberModel.verify(token);
  }

  async unsubscribe(email) {
    const subscriber = await SubscriberModel.findByEmail(email);
    if (!subscriber) {
      throw new Error('Subscriber not found');
    }
    return SubscriberModel.unsubscribe(email);
  }

  async delete(id) {
    return SubscriberModel.delete(id);
  }
}

export default new SubscriberService();
