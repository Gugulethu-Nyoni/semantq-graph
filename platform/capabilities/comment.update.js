/**
 * comment.update
 * 
 * Capability that updates a comment.
 * 
 * Input: { id, content, status }
 * Output: { model: Comment }
 */

export default {
  id: 'comment.update',
  version: '1.0.0',
  description: 'Update a comment',

  async execute(params, context, deps) {
    const { commentService } = context.services;
    
    const comment = await commentService.update(params.id, {
      content: params.content,
      status: params.status
    });

    return {
      model: comment,
      success: true
    };
  }
};
