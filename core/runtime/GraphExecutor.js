/**
 * GraphExecutor
 *
 * Generic DAG execution engine.
 *
 * Responsibilities:
 * - resolve graph dependencies
 * - resolve capabilities
 * - execute capabilities
 * - maintain execution results
 *
 * It has no knowledge of:
 * - HTTP
 * - Express
 * - CLI
 * - Posts
 * - Subscribers
 * - HTML
 * - JSON
 */

export class GraphExecutor {
  constructor({
    capabilityRegistry,
    graphLoader = null
  }) {
    if (!capabilityRegistry) {
      throw new Error('GraphExecutor requires capabilityRegistry');
    }

    this.capabilityRegistry = capabilityRegistry;
    this.graphLoader = graphLoader;
  }

  async execute({
    graph,
    context,
    params = {}
  }) {
    const graphDef =
      typeof graph === 'string'
        ? await this.loadGraph(graph)
        : graph;

    if (!graphDef) {
      throw new Error('Graph is required');
    }

    const executionContext = context
      ? context.with({
          graph: graphDef,
          variables: {
            ...context.variables,
            ...params
          }
        })
      : this.createContext(graphDef, params);

    const entryNode = graphDef.entry;

    if (!entryNode) {
      throw new Error(
        `Graph has no entry node: ${graphDef.id || 'unknown'}`
      );
    }

    const result = await this.executeNode(
      entryNode,
      executionContext,
      graphDef
    );

    return {
      graph: graphDef.id || null,
      result,
      metadata: {
        executedAt: new Date().toISOString(),
        nodeCount: Object.keys(graphDef.nodes || {}).length,
        results: executionContext.getResults()
      }
    };
  }

  createContext(graph, params) {
    return new ExecutionContext({
      graph,
      variables: params
    });
  }

  async executeNode(nodeId, context, graph) {
    if (context.hasResult(nodeId)) {
      return context.getResult(nodeId);
    }

    const node = graph.nodes?.[nodeId];

    if (!node) {
      throw new Error(`Node not found in graph: ${nodeId}`);
    }

    const dependencies =
      node.dependencies ||
      node.deps ||
      [];

    const depResults = [];

    for (const depId of dependencies) {
      const result = await this.executeNode(
        depId,
        context,
        graph
      );

      depResults.push(result);
    }

    if (node.condition && !this.evaluateCondition(
      node.condition,
      context
    )) {
      return undefined;
    }

    const capability =
      this.capabilityRegistry.get(node.capability);

    if (!capability) {
      throw new Error(
        `Capability not found: ${node.capability}`
      );
    }

    const params = this.resolveParams(
      node.params || {},
      context,
      dependencies
    );

    const result = await this.executeCapability(
      capability,
      params,
      context,
      depResults,
      node
    );

    context.setResult(nodeId, result);

    return result;
  }

  resolveParams(params, context, dependencies) {
    const resolved = {
      ...context.variables,
      ...params
    };

    for (const depId of dependencies) {
      const result = context.getResult(depId);

      if (result === undefined) {
        continue;
      }

      const token = `{{${depId}.result}}`;

      for (const [key, value] of Object.entries(resolved)) {
        if (value === token) {
          resolved[key] = result;
        }
      }
    }

    return resolved;
  }

  evaluateCondition(condition, context) {
    if (typeof condition !== 'string') {
      return true;
    }

    if (condition.startsWith('!')) {
      const nodeId = condition.slice(1);
      return !context.getResult(nodeId);
    }

    const [nodeId, ...path] = condition.split('.');
    const result = context.getResult(nodeId);

    if (!path.length) {
      return Boolean(result);
    }

    return Boolean(
      path.reduce(
        (value, key) => value?.[key],
        result
      )
    );
  }

  async executeCapability(
    capability,
    params,
    context,
    depResults,
    node
  ) {
    if (typeof capability === 'function') {
      return capability(
        params,
        context,
        depResults
      );
    }

    if (
      capability &&
      typeof capability.execute === 'function'
    ) {
      return capability.execute(
        params,
        context,
        depResults
      );
    }

    if (
      capability &&
      typeof capability.default === 'function'
    ) {
      return capability.default(
        params,
        context,
        depResults
      );
    }

    if (
      capability &&
      typeof capability.render === 'function'
    ) {
      return capability.render(
        params,
        context,
        depResults
      );
    }

    throw new Error(
      `Invalid capability: ${node.capability}`
    );
  }

  async loadGraph(graphId) {
    if (!this.graphLoader) {
      throw new Error(
        'Graph loader not available'
      );
    }

    return this.graphLoader.load(graphId);
  }
}

import { ExecutionContext } from './ExecutionContext.js';
