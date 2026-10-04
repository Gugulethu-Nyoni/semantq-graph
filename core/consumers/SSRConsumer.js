export class SSRConsumer {
  constructor(templateRenderer) {
    if (!templateRenderer) {
      throw new Error('TemplateRenderer is required');
    }
    this.renderer = templateRenderer;
  }

  render(manifest) {
    if (!manifest) {
      throw new Error('Manifest is required');
    }

    if (!manifest.data) {
      throw new Error('Manifest data is required');
    }

    if (!manifest.component) {
      throw new Error('Manifest component is required');
    }

    const html = this.renderer.render(
      manifest.component,
      manifest.data
    );

    return html;
  }
}
