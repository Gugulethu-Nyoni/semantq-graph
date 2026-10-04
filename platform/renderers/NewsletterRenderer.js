/**
 * Newsletter Renderer
 * 
 * Renders newsletter HTML for email delivery
 */

export class NewsletterRenderer {
  render(post, config = {}) {
    const baseUrl = config.baseUrl || 'http://localhost:3003';
    const postUrl = `${baseUrl}/post/blog/${post.slug}`;
    const unsubscribeUrl = `${baseUrl}/post/subscriber/unsubscribe?email={{email}}`;
    
    console.log('[NewsletterRenderer] Generated post URL:', postUrl);
    console.log('[NewsletterRenderer] Generated unsubscribe URL:', unsubscribeUrl);
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    h1 { 
      color: #1a1a2e; 
      font-size: 24px; 
      margin-bottom: 8px;
    }
    .meta { 
      color: #666; 
      font-size: 14px; 
      border-bottom: 1px solid #eee; 
      padding-bottom: 10px; 
      margin-bottom: 20px; 
    }
    .content { 
      font-size: 16px; 
      line-height: 1.7; 
    }
    .content h1, .content h2, .content h3 {
      color: #1a1a2e;
    }
    .content p {
      margin-bottom: 16px;
    }
    .cta { 
      margin-top: 24px; 
      text-align: center;
    }
    .cta a { 
      display: inline-block; 
      padding: 12px 28px; 
      background: #6c63ff; 
      color: #ffffff; 
      text-decoration: none; 
      border-radius: 6px; 
      font-weight: 500; 
    }
    .cta a:hover {
      background: #5a52d5;
    }
    .footer { 
      margin-top: 30px; 
      padding-top: 20px; 
      border-top: 1px solid #eee; 
      font-size: 12px; 
      color: #999; 
      text-align: center;
    }
    .footer a {
      color: #6c63ff;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1>${post.title}</h1>
  <p class="meta">By ${post.author?.name || 'Unknown'}${post.published_at ? ` · ${new Date(post.published_at).toLocaleDateString()}` : ''}</p>
  
  <div class="content">${post.content || ''}</div>
  
  <div class="cta">
    <a href="${postUrl}">Read full article</a>
  </div>
  
  <div class="footer">
    <p>You received this because you subscribed to our blog.</p>
    <p><a href="${unsubscribeUrl}">Unsubscribe</a></p>
  </div>
</body>
</html>`;
  }
}
