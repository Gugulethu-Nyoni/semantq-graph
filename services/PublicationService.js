/**
 * Publication Service
 * 
 * Business logic for publication management.
 */

import PublicationModel from '../models/mysql/Publication.js';

class PublicationService {
  async create(data) {
    return PublicationModel.create(data);
  }

  async getById(id) {
    return PublicationModel.findById(id);
  }

  async getBySlug(slug) {
    return PublicationModel.findBySlug(slug);
  }

  async getAll() {
    return PublicationModel.findAll();
  }

  async update(id, data) {
    return PublicationModel.update(id, data);
  }

  async delete(id) {
    return PublicationModel.delete(id);
  }
}

export default new PublicationService();
