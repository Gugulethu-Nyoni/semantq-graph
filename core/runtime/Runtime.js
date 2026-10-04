/**
 * Runtime
 *
 * Public orchestration boundary for graph execution.
 *
 * Runtime knows:
 * - intents
 * - graphs
 * - execution context
 *
 * Runtime does NOT know:
 * - Express
 * - HTTP
 * - CLI
 * - queues
 * - domain services
 */

import { ExecutionContext } from './ExecutionContext.js';

export class Runtime {
  constructor({
    graphExecutor,
    graphLoader
  }) {
    if (!graphExecutor) {
      throw new Error(
        'Runtime requires graphExecutor'
      );
    }

    if (!graphLoader) {
      throw new Error(
        'Runtime requires graphLoader'
      );
    }

    this.graphExecutor = graphExecutor;
    this.graphLoader = graphLoader;
  }

  async execute({
    intent = null,
    graph = null,
    params = {},
    context = null
  } = {}) {
    let graphDef = graph;

    if (!graphDef && intent) {
      graphDef =
        await this.graphLoader.loadByIntent(intent);
    }

    if (!graphDef) {
      throw new Error(
        'Either intent or graph must be provided'
      );
    }

    const executionContext =
      context ||
      new ExecutionContext({
        variables: params
      });

    return this.graphExecutor.execute({
      graph: graphDef,
      context: executionContext,
      params
    });
  }

  async executeIntent(
    intent,
    params = {},
    context = null
  ) {
    return this.execute({
      intent,
      params,
      context
    });
  }

  async executeGraph(
    graphId,
    params = {},
    context = null
  ) {
    const graph =
      await this.graphLoader.load(graphId);

    return this.execute({
      graph,
      params,
      context
    });
  }
}
