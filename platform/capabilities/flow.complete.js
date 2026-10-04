/**
 * Flow Complete Capability
 * 
 * Marks a workflow as complete and returns the result.
 */

export function createFlowComplete() {
  return async function flowComplete(params, context) {
    console.log('[flow.complete] Called with params:', JSON.stringify(params, null, 2));
    
    // The result should come from the previous node via params.result
    // This is injected by the GraphExecutor from the dependency
    let result = params.result || params.data || params;
    
    // If result has a data property, unwrap it
    if (result && result.data) {
      result = result.data;
    }
    
    // Ensure we always return a valid response
    const response = {
      success: true,
      data: result || { message: 'Flow completed' },
      message: 'Flow completed successfully'
    };
    
    console.log('[flow.complete] Returning:', JSON.stringify(response, null, 2));
    return response;
  };
}
