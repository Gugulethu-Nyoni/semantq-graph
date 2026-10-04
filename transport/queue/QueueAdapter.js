/**
 * QueueAdapter
 * 
 * Queue transport adapter for the Runtime.
 * 
 * Responsibilities:
 * 1. Receive queue messages
 * 2. Build ExecutionContext from message
 * 3. Call Runtime.execute()
 * 4. Acknowledge or reject
 */

import { ExecutionContext } from '../../core/runtime/ExecutionContext.js';

export class QueueAdapter {
  constructor({ runtime }) {
    this.runtime = runtime;
    this.name = 'queue';
    this.handlers = new Map();
  }

  /**
   * Register a queue handler
   * @param {string} queue - Queue name
   * @param {Object} config - { intent, params, context }
   */
  register(queue, config) {
    this.handlers.set(queue, {
      queue,
      intent: config.intent,
      params: config.params || {},
      context: config.context || {}
    });
    return this;
  }

  /**
   * Process a queue message
   * @param {string} queue - Queue name
   * @param {Object} message - Queue message payload
   * @param {Object} metadata - Queue metadata
   */
  async process(queue, message, metadata = {}) {
    const handler = this.handlers.get(queue);
    if (!handler) {
      throw new Error(`No handler for queue: ${queue}`);
    }

    try {
      // Build context
      const context = this.buildContext(handler, message, metadata);

      // Execute
      const result = await this.runtime.execute({
        intent: handler.intent,
        params: { ...handler.params, ...message },
        context
      });

      // Log success
      this.logResult(handler, message, result);

      return { success: true, result };

    } catch (error) {
      console.error(`[Queue] ${queue} processing failed:`, error.message);
      throw error;
    }
  }

  /**
   * Build ExecutionContext
   */
  buildContext(handler, message, metadata) {
    return new ExecutionContext({
      transport: 'queue',
      representation: 'json',
      params: { ...handler.params, ...message },
      metadata: {
        source: 'queue',
        queue: handler.queue,
        messageId: metadata.messageId || 'unknown',
        timestamp: new Date().toISOString()
      },
      principal: { id: 'queue-system' },
      services: {},
      registries: {},
      environment: process.env.NODE_ENV || 'development',
      ...handler.context
    });
  }

  /**
   * Log result
   */
  logResult(handler, message, result) {
    console.log(`[Queue] ${handler.queue} processed:`, {
      timestamp: new Date().toISOString(),
      messageId: message.id || 'unknown',
      success: true
    });
  }

  /**
   * List all registered queues
   */
  list() {
    return Array.from(this.handlers.values()).map(h => ({
      queue: h.queue,
      intent: h.intent
    }));
  }
}
