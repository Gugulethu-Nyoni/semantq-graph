/**
 * Post Service
 * 
 * Business logic for post management.
 */

import PostModel from '../models/mysql/Post.js';

class PostService {
  async create(data) {
    // Require publication_id
    if (!data.publication_id) {
      throw new Error('publication_id is required');
    }
    return PostModel.create(data);
  }

  async getById(id) {
    return PostModel.findById(id);
  }

  async getBySlug(slug) {
    return PostModel.findBySlug(slug);
  }

  async getByIdentifier(identifier) {
    const isNumeric = /^\d+$/.test(String(identifier));
    if (isNumeric) {
      return await PostModel.findById(parseInt(identifier));
    } else {
      return await PostModel.findBySlug(identifier);
    }
  }

  async getByPublication(publicationId, status = 'published') {
    const allPosts = await PostModel.findAll();
    return allPosts.filter(p => p.publication_id === publicationId && p.status === status);
  }

  async getAll() {
    return PostModel.findAll();
  }

  async getPublished() {
    return PostModel.findPublished();
  }

  async update(id, data) {
    return PostModel.update(id, data);
  }

  async delete(id) {
    return PostModel.delete(id);
  }

  async claimNewsletterSend(postId) {
    const prisma = await import('../lib/prisma.js').then(m => m.default);
    const client = await prisma();
    const result = await client.post.updateMany({
      where: {
        id: postId,
        newsletter_sent_at: null
      },
      data: {
        newsletter_sent_at: new Date()
      }
    });
    return result.count > 0;
  }

  // Trigger workflow after publish
  async publishPost(id, runtime) {
    const oldPost = await this.getById(id);
    
    if (!oldPost) {
      throw new Error('Post not found');
    }
    
    const post = await this.update(id, { 
      status: 'published', 
      published_at: new Date() 
    });
    
    // Only trigger on draft/review → published transition
    if (oldPost.status !== 'published' && post.status === 'published' && runtime) {
      await runtime.execute('post.published', {
        slug: post.slug
      }, {});
    }
    
    return post;
  }
}

export default new PostService();
