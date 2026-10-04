/**
 * Email Renderer
 * 
 * Converts manifest data into HTML email.
 * Simple for now - can be replaced with MJML or similar.
 */

export class EmailRenderer {
  render(component, data) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
      line-height: 1.6;
    }
    h1 { color: #1a1a2e; margin-bottom: 10px; }
    .meta { color: #666; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
    .content { font-size: 16px; }
    .cta { margin-top: 30px; }
    .cta a { display: inline-block; background: #6c63ff; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <h1>${data.title || 'New Post'}</h1>
  ${data.author ? `<p class="meta">By ${data.author.name}</p>` : ''}
  <div class="content">${data.content || data.body || ''}</div>
  ${data.url ? `<div class="cta"><a href="${data.url}">Read full post →</a></div>` : ''}
  <div class="footer">
    <p>You received this because you subscribed to updates.</p>
    <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
  </div>
</body>
</html>`;
  }
}
