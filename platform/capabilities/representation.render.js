/**
 * representation.render
 * 
 * Capability that renders a representation.
 * 
 * Input: deps from previous graph nodes
 *   - Data from resource.execute
 *   - Context with representation
 * 
 * Output: RepresentationResponse
 *   - body: string
 *   - status: number
 *   - mediaType: string
 *   - headers: object
 */

export default async function representationRender(params, context, deps) {
  const { representationManager } = context.services || {};
  
  if (!representationManager) {
    throw new Error('representationManager not found in context');
  }
  
  // Get data from previous node
  const resourceResult = deps && deps[0];
  
  if (!resourceResult || !resourceResult.data) {
    throw new Error('No data to render');
  }

  // Get representation from context
  const { representation } = context;
  
  if (!representation) {
    throw new Error('No representation in context');
  }

  // Render through RepresentationManager
  const result = await representationManager.present({
    resource: resourceResult.resource,
    model: resourceResult.data,
    context: context,
    options: {
      ...params,
      metadata: resourceResult.metadata
    }
  });

  // Return standardized output
  return {
    body: result.body,
    status: result.status,
    mediaType: result.mediaType,
    headers: result.headers
  };
}
