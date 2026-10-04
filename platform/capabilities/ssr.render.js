/**
 * SSR Render Capability
 * 
 * Renders a post as HTML using the template engine.
 */

import { TemplateRenderer } from '../renderers/TemplateRenderer.js';

const renderer = new TemplateRenderer();

export function createSSRRender() {
  return async function ssrRender(params, context) {
    console.log('[ssr.render] Called with params:', JSON.stringify(params, null, 2));
    
    const post = params.post || params.resolve?.result;
    
    if (!post) {
      console.error('[ssr.render] No post found');
      return {
        type: 'html',
        body: '<h1>Post not found</h1>'
      };
    }
    
    console.log('[ssr.render] Rendering post:', post.id, post.slug);
    
    try {
      // Render the post using the template renderer
      const html = await renderer.render('post/detail', {
        post: post,
        title: post.title,
        meta: {
          description: post.excerpt || post.content?.substring(0, 200) || ''
        }
      });
      
      console.log('[ssr.render] HTML rendered, length:', html?.length || 0);
      
      return {
        type: 'html',
        body: html
      };
    } catch (error) {
      console.error('[ssr.render] Error:', error.message);
      return {
        type: 'html',
        body: `<h1>Error rendering post</h1><p>${error.message}</p>`
      };
    }
  };
}
