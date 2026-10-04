/**
 * Manifest Builder Capability
 * 
 * Converts resolved resources into a universal manifest.
 * Uses the manifest contract from platform/contracts/
 */

import { createManifest } from '../contracts/manifest.v1.js';

export function createManifestBuilder() {
  return async function buildManifest(params, context, deps) {
    const resource = deps.resolve;

    return createManifest({
      type: 'page',
      adapter: 'html',
      component: 'detail',
      data: {
        id: resource.id,
        title: resource.title,
        slug: resource.slug,
        content: resource.content,
        excerpt: resource.excerpt,
        author: resource.author,
        publishedAt: resource.published_at
      },
      meta: {
        title: resource.title,
        description: resource.excerpt || resource.title
      }
    });
  };
}
