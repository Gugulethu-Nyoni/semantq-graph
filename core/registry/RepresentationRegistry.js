/**
 * Representation Registry
 * 
 * Registers and retrieves representation renderers with metadata.
 * Follows the same pattern as CapabilityRegistry.
 * 
 * Future-proof registration includes:
 * - mediaTypes for content negotiation
 * - extensions for file-based routing
 * - versioning for renderer upgrades
 */

export class RepresentationRegistry {
  constructor() {
    this.renderers = new Map();
    this.byMediaType = new Map();
    this.byExtension = new Map();
  }

  /**
   * Register a representation renderer with metadata
   * 
   * @param {Object} config
   * @param {string} config.id - 'html', 'json', 'rss', etc.
   * @param {Object} config.renderer - Renderer with a render() method
   * @param {number} config.version - Renderer version (default: 1)
   * @param {string[]} config.mediaTypes - Content types (e.g., ['text/html'])
   * @param {string[]} config.extensions - File extensions (e.g., ['.html'])
   */
  register({ id, renderer, version = 1, mediaTypes = [], extensions = [] }) {
    if (this.renderers.has(id)) {
      throw new Error(`Representation already registered: ${id}`);
    }

    const entry = {
      id,
      renderer,
      version,
      mediaTypes,
      extensions
    };

    this.renderers.set(id, entry);

    // Index by media type
    for (const mediaType of mediaTypes) {
      if (!this.byMediaType.has(mediaType)) {
        this.byMediaType.set(mediaType, []);
      }
      this.byMediaType.get(mediaType).push(id);
    }

    // Index by extension
    for (const extension of extensions) {
      if (!this.byExtension.has(extension)) {
        this.byExtension.set(extension, []);
      }
      this.byExtension.get(extension).push(id);
    }
  }

  /**
   * Get a representation renderer by ID
   * @param {string} id - Representation ID
   * @returns {Object} { id, renderer, version, mediaTypes, extensions }
   */
  get(id) {
    const entry = this.renderers.get(id);
    if (!entry) {
      throw new Error(`Unknown representation: ${id}`);
    }
    return entry;
  }

  /**
   * Get the renderer instance by ID
   * @param {string} id - Representation ID
   * @returns {Object} Renderer instance
   */
  getRenderer(id) {
    return this.get(id).renderer;
  }

  /**
   * Check if a representation is registered
   * @param {string} id - Representation ID
   * @returns {boolean}
   */
  has(id) {
    return this.renderers.has(id);
  }

  /**
   * Find representations by media type
   * @param {string} mediaType - Content type (e.g., 'text/html')
   * @returns {string[]} Representation IDs
   */
  findByMediaType(mediaType) {
    return this.byMediaType.get(mediaType) || [];
  }

  /**
   * Find representations by file extension
   * @param {string} extension - File extension (e.g., '.html')
   * @returns {string[]} Representation IDs
   */
  findByExtension(extension) {
    return this.byExtension.get(extension) || [];
  }

  /**
   * Remove a representation
   * @param {string} id - Representation ID
   * @returns {boolean}
   */
  unregister(id) {
    const entry = this.renderers.get(id);
    if (!entry) return false;

    // Remove from indexes
    for (const mediaType of entry.mediaTypes) {
      const ids = this.byMediaType.get(mediaType);
      if (ids) {
        const index = ids.indexOf(id);
        if (index !== -1) ids.splice(index, 1);
        if (ids.length === 0) this.byMediaType.delete(mediaType);
      }
    }

    for (const extension of entry.extensions) {
      const ids = this.byExtension.get(extension);
      if (ids) {
        const index = ids.indexOf(id);
        if (index !== -1) ids.splice(index, 1);
        if (ids.length === 0) this.byExtension.delete(extension);
      }
    }

    return this.renderers.delete(id);
  }

  /**
   * List all registered representation IDs
   * @returns {string[]}
   */
  list() {
    return Array.from(this.renderers.keys());
  }
}
