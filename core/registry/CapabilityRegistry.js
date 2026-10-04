export class CapabilityRegistry {
  constructor() {
    this.handlers = new Map();
  }

  register(capability, handler) {
    if (this.handlers.has(capability)) {
      throw new Error(`Capability already registered: ${capability}`);
    }
    this.handlers.set(capability, handler);
  }

  get(capability) {
    const handler = this.handlers.get(capability);
    if (!handler) {
      throw new Error(`Unknown capability: ${capability}`);
    }
    return handler;
  }

  has(capability) {
    return this.handlers.has(capability);
  }

  unregister(capability) {
    return this.handlers.delete(capability);
  }
}
