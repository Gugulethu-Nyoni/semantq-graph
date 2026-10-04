/**
 * Template Renderer
 * 
 * Renders HTML from manifests or post data with comments.
 */

export class TemplateRenderer {
  render(component, data) {
    // Extract content from either direct data or post object
    const title = data.title || data.post?.title || 'Blog Post';
    const content = data.content || data.post?.content || '';
    const author = data.author || data.post?.author || null;
    const excerpt = data.excerpt || data.post?.excerpt || '';
    const description = data.meta?.description || excerpt || content?.substring(0, 200) || '';
    const publishedAt = data.post?.published_at || data.published_at || null;
    
    // Extract comments from data
    const comments = data.comments || data.post?.comments || [];
    
    console.log('[TemplateRenderer] Rendering:', { 
      title, 
      contentLength: content?.length || 0,
      hasAuthor: !!author,
      commentCount: comments?.length || 0
    });

    // Generate comments HTML
    const commentsHtml = this.renderComments(comments);
    
    return `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${description.replace(/<[^>]*>/g, '').substring(0, 200)}">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1 {
      color: #1a1a2e;
      font-size: 2.5em;
      margin-bottom: 0.5em;
    }
    .meta {
      color: #666;
      font-size: 0.9em;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .content {
      font-size: 1.1em;
      line-height: 1.8;
    }
    .content h1, .content h2, .content h3 {
      color: #1a1a2e;
    }
    .content p {
      margin-bottom: 1.5em;
    }
    
    /* Comments Section */
    .comments-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #eee;
    }
    .comments-section h2 {
      font-size: 1.5em;
      color: #1a1a2e;
      margin-bottom: 20px;
    }
    .comment {
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .comment:last-child {
      border-bottom: none;
    }
    .comment .comment-meta {
      font-size: 0.9em;
      color: #666;
      margin-bottom: 5px;
    }
    .comment .comment-meta .comment-author {
      font-weight: 600;
      color: #1a1a2e;
    }
    .comment .comment-content {
      margin-left: 10px;
      padding-left: 10px;
      border-left: 3px solid #eee;
    }
    .comment .replies {
      margin-left: 30px;
      padding-left: 15px;
      border-left: 2px solid #e8e8e8;
    }
    .no-comments {
      color: #999;
      font-style: italic;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 0.8em;
      color: #999;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    ${author?.name ? `By ${author.name}` : ''}
    ${publishedAt ? ` · ${new Date(publishedAt).toLocaleDateString()}` : ''}
  </div>
  <div class="content">
    ${content || '<p>No content available</p>'}
  </div>
  
  <!-- Comments Section -->
  <div class="comments-section">
    <h2>Comments (${comments?.length || 0})</h2>
    ${commentsHtml}
  </div>
  
  <div class="footer">
    <p>Published via Semantq</p>
  </div>
</body>
</html>`;
  }

  /**
   * Render comments recursively with replies
   */
  renderComments(comments, depth = 0) {
    if (!comments || comments.length === 0) {
      return '<p class="no-comments">No comments yet. Be the first to comment!</p>';
    }

    // Filter out any comments that might have been deleted
    const visibleComments = comments.filter(c => c.status !== 'deleted');
    
    if (visibleComments.length === 0) {
      return '<p class="no-comments">No comments yet. Be the first to comment!</p>';
    }

    // Separate top-level comments and replies
    const topLevel = visibleComments.filter(c => !c.parent_id);
    const replies = visibleComments.filter(c => c.parent_id);
    
    // Build a map of parent_id → replies
    const repliesMap = {};
    for (const reply of replies) {
      const parentId = reply.parent_id;
      if (!repliesMap[parentId]) {
        repliesMap[parentId] = [];
      }
      repliesMap[parentId].push(reply);
    }

    // Helper to render a single comment with its replies
    const renderCommentWithReplies = (comment, depth) => {
      const name = comment.guest_name || comment.author?.name || comment.subscriber?.first_name || 'Anonymous';
      const date = comment.created_at ? new Date(comment.created_at).toLocaleDateString() : '';
      const content = comment.content || '';
      const isReply = depth > 0;
      const indentClass = isReply ? 'replies' : '';
      
      let html = `
        <div class="comment">
          <div class="comment-meta">
            <span class="comment-author">${name}</span>
            <span>${date}</span>
          </div>
          <div class="comment-content">
            <p>${content}</p>
          </div>
      `;
      
      // Render replies
      const childReplies = repliesMap[comment.id] || [];
      if (childReplies.length > 0) {
        html += `<div class="replies">`;
        for (const reply of childReplies) {
          html += renderCommentWithReplies(reply, depth + 1);
        }
        html += `</div>`;
      }
      
      html += `</div>`;
      return html;
    };

    let html = '';
    for (const comment of topLevel) {
      html += renderCommentWithReplies(comment, 0);
    }
    
    // If no top-level comments but there are replies (shouldn't happen normally)
    if (html === '' && visibleComments.length > 0) {
      for (const comment of visibleComments) {
        html += renderCommentWithReplies(comment, 0);
      }
    }
    
    return html;
  }
}