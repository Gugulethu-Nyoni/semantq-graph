/**
 * comment.delete
 * 
 * Capability that deletes a comment.
 * 
 * Input: { id }
 * Output: { success: true }
 */

export default {
  id: 'comment.delete',
  version: '1.0.0',
  description: 'Delete a comment',

  async execute(params, context, deps) {
    const { commentService } = context.services;
    
    await commentService.delete(params.id);

    return {
      success: true
    };
  }
};
