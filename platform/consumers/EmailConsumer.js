/**
 * Email Consumer
 * 
 * Converts a manifest into an email payload.
 * Does NOT send email - that's message.dispatch's job.
 * 
 * CONTRACT:
 * - render(manifest) => { subject, html, text, recipients, template, data }
 * - Manifest contains adapter: 'email'
 * 
 * RESPONSIBILITIES:
 * - Receive manifest from runtime
 * - Render email HTML
 * - Extract subject and recipients from manifest
 * - Return email payload
 * 
 * DOES NOT:
 * - Send email (that's message.dispatch)
 * - Know about SMTP/mail providers
 */

export class EmailConsumer {
  constructor(emailRenderer) {
    if (!emailRenderer) {
      throw new Error('EmailRenderer is required');
    }
    this.renderer = emailRenderer;
  }

  render(manifest) {
    if (!manifest) {
      throw new Error('Manifest is required');
    }

    if (!manifest.data) {
      throw new Error('Manifest data is required');
    }

    // Extract subject from manifest meta
    const subject = manifest.meta?.title || manifest.data.title || 'New Post';

    // Extract recipients
    const recipients = manifest.meta?.recipients || [];

    // Render HTML
    const html = this.renderer.render(
      manifest.component || 'post',
      manifest.data
    );

    // Simple text version
    const text = this.stripHtml(html);

    return {
      subject,
      html,
      text,
      recipients,
      template: manifest.component || 'post',
      data: manifest.data
    };
  }

  stripHtml(html) {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
