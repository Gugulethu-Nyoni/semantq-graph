/**
 * comment.create
 * 
 * Capability that creates a comment.
 * 
 * Input: { postId, content, authorId, subscriberId }
 * Output: { model: Comment, success: true }
 */

export default {
  id: 'comment.create',
  version: '1.0.0',
  description: 'Create a comment',

  async execute(params, context, deps) {
    const { commentService } = context.services;
    
    const comment = await commentService.create({
      postId: params.postId,
      content: params.content,
      authorId: context.principal?.id || params.authorId,
      subscriberId: context.subscriber?.id || params.subscriberId,
      status: 'pending'
    });

    return {
      model: comment,
      success: true
    };
  }
};
