/**
 * Post Resolve Capability
 * 
 * Resolves a post by slug using postService.
 */

import postService from '../../services/postService.js';

export function createPostResolve() {
  return async function resolvePost(params, context) {
    console.log('[post.resolve] Called with params:', JSON.stringify(params, null, 2));
    
    const { slug } = params;

    if (!slug) {
      console.error('[post.resolve] No slug provided');
      throw new Error('Slug is required');
    }

    console.log('[post.resolve] Looking up post:', slug);
    const post = await postService.getByIdentifier(slug);

    if (!post) {
      console.error('[post.resolve] Post not found:', slug);
      throw new Error(`Post not found: ${slug}`);
    }

    console.log('[post.resolve] Found post:', post.id, post.slug);
    console.log('[post.resolve] publication_id:', post.publication_id);
    console.log('[post.resolve] status:', post.status);
    
    // ✅ Ensure all fields are present
    return post;
  };
}
