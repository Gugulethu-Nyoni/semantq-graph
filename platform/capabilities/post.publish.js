/**
 * Post Publish Capability
 * 
 * Publishes a post using postService.
 */

import postService from '../../services/postService.js';

export function createPostPublish() {
  return async function postPublish(params, context) {
    console.log('[post.publish] Called with params:', JSON.stringify(params, null, 2));
    console.log('[post.publish] Context keys:', Object.keys(context || {}));
    
    try {
      // The post should come from the resolve node result
      const post = params.post || params.resolve?.result;
      
      if (!post) {
        console.error('[post.publish] No post found in params:', params);
        throw new Error('Post object is required');
      }
      
      if (!post.id) {
        console.error('[post.publish] Post has no id:', post);
        throw new Error('Post ID is required');
      }
      
      console.log('[post.publish] Publishing post:', post.id, post.slug, post.title);
      
      // Update the post status to published
      const updatedPost = await postService.update(post.id, {
        status: 'published',
        published_at: new Date()
      });
      
      console.log('[post.publish] Published post:', updatedPost.id, updatedPost.slug);
      
      return {
        success: true,
        data: updatedPost,
        message: `Post "${updatedPost.title}" published successfully`
      };
      
    } catch (error) {
      console.error('[post.publish] Error:', error.message);
      console.error('[post.publish] Stack:', error.stack);
      throw error;
    }
  };
}
