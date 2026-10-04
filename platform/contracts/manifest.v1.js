/**
 * Manifest Contract v1
 * 
 * The manifest is the universal boundary between execution and delivery.
 * All consumers receive a manifest, never raw capability output.
 * 
 * Manifest Shape:
 * {
 *   version: 1,
 *   type: 'page' | 'list' | 'feed' | 'email',
 *   adapter: 'html' | 'json' | 'rss' | 'pdf',
 *   component: string,
 *   data: object,
 *   meta: { title, description, ... }
 * }
 */

export const MANIFEST_VERSION = 1;

export function validateManifest(manifest) {
  if (!manifest) {
    throw new Error('Manifest is required');
  }

  if (!manifest.version) {
    throw new Error('Missing manifest version');
  }

  if (manifest.version !== MANIFEST_VERSION) {
    throw new Error(`Unsupported manifest version: ${manifest.version}`);
  }

  if (!manifest.adapter) {
    throw new Error('Missing adapter');
  }

  if (!manifest.component) {
    throw new Error('Missing component');
  }

  if (!manifest.data) {
    throw new Error('Missing data');
  }

  return true;
}

export function createManifest({
  type = 'page',
  adapter = 'html',
  component = 'detail',
  data = {},
  meta = {}
}) {
  const manifest = {
    version: MANIFEST_VERSION,
    type,
    adapter,
    component,
    data,
    meta
  };

  validateManifest(manifest);
  return manifest;
}
