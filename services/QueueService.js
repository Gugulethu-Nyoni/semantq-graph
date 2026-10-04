/**
 * Queue Service
 * 
 * Business logic for queue job management.
 */

import QueueJobModel from '../models/mysql/QueueJob.js';

class QueueService {
  async enqueue(data) {
    return QueueJobModel.create(data);
  }

  async getById(id) {
    return QueueJobModel.findById(id);
  }

  async getAll() {
    return QueueJobModel.findAll();
  }

  async findPending(limit = 10) {
    return QueueJobModel.findPending(limit);
  }

  async findPendingByType(type, limit = 10) {
    return QueueJobModel.findPendingByType(type, limit);
  }

  async lockJob(id, workerId, lockDuration = 300) {
    return QueueJobModel.lockJob(id, workerId, lockDuration);
  }

  async markProcessing(id) {
    return QueueJobModel.markProcessing(id);
  }

  async markCompleted(id) {
    return QueueJobModel.markCompleted(id);
  }

  async markFailed(id, error) {
    return QueueJobModel.markFailed(id, error);
  }

  async incrementAttempts(id) {
    return QueueJobModel.incrementAttempts(id);
  }

  async findExpiredLocks() {
    return QueueJobModel.findExpiredLocks();
  }

  async recoverExpiredLocks() {
    return QueueJobModel.recoverExpiredLocks();
  }

  async getStats() {
    return QueueJobModel.getStats();
  }

  async delete(id) {
    return QueueJobModel.delete(id);
  }
}

export default new QueueService();
