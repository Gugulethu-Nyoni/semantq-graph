/**
 * ExecutionContext
 *
 * Runtime-scoped execution state.
 *
 * Carries:
 * - request/context data
 * - graph variables
 * - node results
 * - execution metadata
 */

export class ExecutionContext {
  constructor({
    variables = {},
    graph = null,
    request = null,
    metadata = {}
  } = {}) {
    this.variables = variables;
    this.graph = graph;
    this.request = request;
    this.metadata = metadata;
    this.results = new Map();
  }

  with(values = {}) {
    const context = new ExecutionContext({
      variables: {
        ...this.variables,
        ...(values.variables || {})
      },
      graph: values.graph !== undefined ? values.graph : this.graph,
      request: values.request !== undefined ? values.request : this.request,
      metadata: {
        ...this.metadata,
        ...(values.metadata || {})
      }
    });

    for (const [key, value] of this.results.entries()) {
      context.results.set(key, value);
    }

    return context;
  }

  setResult(nodeId, result) {
    this.results.set(nodeId, result);
    return result;
  }

  getResult(nodeId) {
    return this.results.get(nodeId);
  }

  hasResult(nodeId) {
    return this.results.has(nodeId);
  }

  getResults() {
    return Object.fromEntries(this.results.entries());
  }
}
