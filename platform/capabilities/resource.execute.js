/**
 * resource.execute
 * 
 * Capability that executes a resource operation.
 * 
 * Input: params from graph
 *   - resource: 'post', 'publication', 'product', etc.
 *   - capability: 'detail', 'list', 'publish', etc.
 *   - identifier: slug or ID
 *   - payload: data for create/update
 *   - filters: filters for list/search
 * 
 * Output: OperationResult
 *   - success: true
 *   - resource: 'post'
 *   - capability: 'detail'
 *   - data: { ... } or [ ... ]
 *   - metadata: { ... }
 */

export default async function resourceExecute(params, context, deps) {
  const { resourceManager } = context.services || {};
  
  if (!resourceManager) {
    throw new Error('resourceManager not found in context');
  }
  
  // Get params from graph execution
  const { 
    resource, 
    capability = 'detail',
    identifier,
    payload,
    filters
  } = params;

  if (!resource) {
    throw new Error('resource.execute requires "resource" parameter');
  }

  // Execute through ResourceManager
  const result = await resourceManager.handle({
    resource,
    intent: capability,
    identifier,
    payload,
    filters,
    context
  });

  // Standardize output
  return {
    success: true,
    resource: result.resource,
    capability: result.intent,
    data: result.model || result.models || null,
    metadata: result.metadata || {}
  };
}
