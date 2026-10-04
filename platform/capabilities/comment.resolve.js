/**
 * comment.resolve
 * 
 * Capability that resolves comments for a post.
 * 
 * Input: { postId }
 * Output: { models: Comment[] }
 */

export default {
  id: 'comment.resolve',
  version: '1.0.0',
  description: 'Resolve comments for a post',

  async execute(params, context, deps) {
    const { commentService } = context.services;
    
    const comments = await commentService.getByPost(params.postId, {
      status: 'approved'
    });

    return {
      models: comments,
      count: comments.length
    };
  }
};
