/**
 * Publication Create Capability
 * 
 * Creates a new publication.
 * Called by the publication.create intent.
 */

export function createPublicationCreate(publicationService) {
  return async function publicationCreate(params, context) {
    const { name, slug, description, logo, default_access, owner_id } = params;

    if (!name || !slug) {
      throw new Error('Name and slug are required');
    }

    const publication = await publicationService.create({
      name,
      slug,
      description,
      logo,
      default_access: default_access || 'public',
      owner_id: owner_id || context.user?.id || 1,
      status: 'active'
    });

    return {
      id: publication.id,
      name: publication.name,
      slug: publication.slug,
      description: publication.description,
      default_access: publication.default_access,
      owner_id: publication.owner_id
    };
  };
}
