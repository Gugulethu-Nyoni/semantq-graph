/**
 * ResourceDescriptor
 * 
 * Standardized resource representation inside the runtime.
 * 
 * Separates domain data from framework metadata.
 * 
 * Structure:
 * {
 *   descriptor: {
 *     type: 'post',
 *     id: 15,
 *     version: 2,
 *     permissions: ['read', 'update'],
 *     relationships: { author: 'user/23', publication: 'publication/4' },
 *     metadata: { ... }
 *   },
 *   model: { ... }  // Domain data
 * }
 */

export class ResourceDescriptor {
  constructor({ type, id, version = 1, permissions = [], relationships = {}, metadata = {}, model = null }) {
    this.descriptor = {
      type,
      id,
      version,
      permissions,
      relationships,
      metadata
    };
    this.model = model;
  }

  /**
   * Get the descriptor
   */
  getDescriptor() {
    return this.descriptor;
  }

  /**
   * Get the model
   */
  getModel() {
    return this.model;
  }

  /**
   * Check if the user has a permission
   */
  hasPermission(permission) {
    return this.descriptor.permissions.includes(permission);
  }

  /**
   * Get a relationship
   */
  getRelationship(key) {
    return this.descriptor.relationships[key] || null;
  }

  /**
   * Get metadata
   */
  getMetadata(key) {
    return this.descriptor.metadata[key] || null;
  }

  /**
   * Update the model
   */
  setModel(model) {
    this.model = model;
    return this;
  }

  /**
   * Update the descriptor
   */
  setDescriptor(descriptor) {
    this.descriptor = { ...this.descriptor, ...descriptor };
    return this;
  }

  /**
   * Add a permission
   */
  addPermission(permission) {
    if (!this.descriptor.permissions.includes(permission)) {
      this.descriptor.permissions.push(permission);
    }
    return this;
  }

  /**
   * Remove a permission
   */
  removePermission(permission) {
    this.descriptor.permissions = this.descriptor.permissions.filter(p => p !== permission);
    return this;
  }

  /**
   * Add a relationship
   */
  addRelationship(key, value) {
    this.descriptor.relationships[key] = value;
    return this;
  }

  /**
   * Set metadata
   */
  setMetadata(key, value) {
    this.descriptor.metadata[key] = value;
    return this;
  }

  /**
   * Convert to plain object
   */
  toObject() {
    return {
      descriptor: this.descriptor,
      model: this.model
    };
  }

  /**
   * Create from object
   */
  static fromObject(obj) {
    return new ResourceDescriptor({
      type: obj.descriptor.type,
      id: obj.descriptor.id,
      version: obj.descriptor.version || 1,
      permissions: obj.descriptor.permissions || [],
      relationships: obj.descriptor.relationships || {},
      metadata: obj.descriptor.metadata || {},
      model: obj.model
    });
  }
}
