/**
 * Publication Resolve Capability
 * 
 * Resolves a publication from a post.
 */

export function createPublicationResolve(publicationService) {
  return async function resolvePublication(params, context, deps) {
    const post = deps.resolve;
    
    if (!post.publication_id) {
      return null;
    }
    
    const publication = await publicationService.getById(post.publication_id);
    
    if (!publication) {
      throw new Error(`Publication not found: ${post.publication_id}`);
    }
    
    return publication;
  };
}
