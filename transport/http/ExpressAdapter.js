/**
 * ExpressAdapter
 * 
 * HTTP transport adapter for the Runtime.
 * 
 * Responsibilities:
 * 1. Receive HTTP request
 * 2. Build ExecutionContext from request
 * 3. Call Runtime.execute()
 * 4. Write RepresentationResponse to Express response
 * 
 * This is the ONLY place Express is referenced.
 * Everything else is transport-agnostic.
 */

import { ExecutionContext } from '../../core/runtime/ExecutionContext.js';

export class ExpressAdapter {
  constructor({ runtime, representationResolver = null }) {
    this.runtime = runtime;
    this.representationResolver = representationResolver;
    this.name = 'http';
  }

  /**
   * Handle an Express request
   */
  async handle(req, res) {
    try {
      // 1. Build execution context
      const context = this.buildContext(req, res);

      // 2. Get intent from route or request
      const intent = req.intent || req.params.intent || 'view_resource';

      // 3. Get params from request
      const params = {
        ...req.params,
        ...req.query,
        ...req.body,
        resource: req.resource || req.params.resource,
        identifier: req.params.slug || req.params.id
      };

      // 4. Execute the graph
      const result = await this.runtime.execute({
        intent,
        params,
        context
      });

      // 5. Write response
      this.writeResponse(res, result);

    } catch (error) {
      console.error('[ExpressAdapter] Error:', error);
      res.status(500).json({
        error: 'Execution failed',
        message: error.message
      });
    }
  }

  /**
   * Build ExecutionContext from Express request
   */
  buildContext(req, res) {
    // Get representation from middleware
    const representation = req.representation || 'html';
    const resource = req.resource || null;

    // Build services object
    const services = {
      representationManager: req.app?.get('representationManager'),
      resourceManager: req.app?.get('resourceManager')
    };

    // Build registries object
    const registries = {
      representationRegistry: req.app?.get('representationRegistry'),
      resourceRegistry: req.app?.get('resourceRegistry'),
      capabilityRegistry: req.app?.get('capabilityRegistry')
    };

    return new ExecutionContext({
      transport: 'http',
      representation,
      resource,
      params: req.params || {},
      query: req.query || {},
      headers: req.headers || {},
      body: req.body || null,
      metadata: {
        correlationId: req.headers['x-correlation-id'] || req.headers['x-request-id'],
        path: req.path,
        method: req.method,
        source: 'http'
      },
      principal: req.user || req.subscriber || null,
      services,
      registries,
      environment: process.env.NODE_ENV || 'development'
    });
  }

  /**
   * Write RepresentationResponse to Express response
   */
  writeResponse(res, result) {
    // If result has body/status/headers (RepresentationResponse)
    if (result && typeof result === 'object') {
      if (result.body !== undefined) {
        if (result.headers) {
          Object.entries(result.headers).forEach(([key, value]) => {
            res.set(key, value);
          });
        }
        res.status(result.status || 200);
        return res.send(result.body);
      }
    }

    // Default: JSON
    res.json(result);
  }

  /**
   * Express middleware wrapper
   */
  static middleware({ runtime, representationResolver = null }) {
    const adapter = new ExpressAdapter({ runtime, representationResolver });
    return (req, res) => adapter.handle(req, res);
  }
}
