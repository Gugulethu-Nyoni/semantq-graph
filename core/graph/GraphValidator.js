export class GraphValidator {
  constructor(capabilityRegistry = null) {
    this.capabilityRegistry = capabilityRegistry;
  }

  validate(graph) {
    const errors = [];

    // Schema validation
    if (graph.version === undefined) errors.push('Graph missing version');
    if (graph.checksum === undefined) errors.push('Graph missing checksum');
    if (graph.intents === undefined) errors.push('Graph missing intents');
    if (graph.nodes === undefined) errors.push('Graph missing nodes');
    if (!graph.id) errors.push('Graph missing id');

    // Node validation
    for (const [nodeId, node] of Object.entries(graph.nodes || {})) {
      if (!node.id) errors.push(`Node ${nodeId} missing id`);
      if (!node.capability) errors.push(`Node ${nodeId} missing capability`);
      if (!Array.isArray(node.deps)) errors.push(`Node ${nodeId} deps must be array`);

      // Capability validation
      if (this.capabilityRegistry && !this.capabilityRegistry.has(node.capability)) {
        errors.push(`Node ${nodeId} uses unknown capability: ${node.capability}`);
      }
    }

    // Cycle detection
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (nodeId, path = []) => {
      if (recursionStack.has(nodeId)) {
        errors.push(`Cycle detected: ${path.join(' → ')} → ${nodeId}`);
        return true;
      }
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const node = graph.nodes[nodeId];
      if (node && node.deps) {
        for (const depId of node.deps) {
          if (hasCycle(depId, [...path, nodeId])) return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of Object.keys(graph.nodes || {})) {
      hasCycle(nodeId);
    }

    // Missing dependency detection
    for (const [nodeId, node] of Object.entries(graph.nodes || {})) {
      for (const depId of node.deps) {
        if (!graph.nodes[depId]) {
          errors.push(`Node ${nodeId} depends on missing node: ${depId}`);
        }
      }
    }

    // Unreachable node detection
    const reachable = new Set();
    const markReachable = (nodeId) => {
      if (reachable.has(nodeId)) return;
      reachable.add(nodeId);
      const node = graph.nodes[nodeId];
      if (node && node.deps) {
        for (const depId of node.deps) markReachable(depId);
      }
    };

    for (const intent of Object.values(graph.intents || {})) {
      if (intent.entry && graph.nodes[intent.entry]) markReachable(intent.entry);
    }

    for (const nodeId of Object.keys(graph.nodes || {})) {
      if (!reachable.has(nodeId)) {
        errors.push(`Unreachable node: ${nodeId} (not referenced from any intent)`);
      }
    }

    // Intent validation
    for (const [intentId, intent] of Object.entries(graph.intents || {})) {
      if (!intent.id) errors.push(`Intent ${intentId} missing id`);
      if (!intent.entry) errors.push(`Intent ${intentId} missing entry`);
      if (!graph.nodes[intent.entry]) {
        errors.push(`Intent ${intentId} entry node not found: ${intent.entry}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Graph validation failed:\n${errors.join('\n')}`);
    }

    return true;
  }
}
