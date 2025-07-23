/**
 * Post service for IAP Connect mobile app
 * Handles API calls for post-related operations
 */

import api, { apiUtils } from './api';
import { ENDPOINTS, PAGINATION } from '../utils/constants';

class PostService {
  /**
   * Get user feed
   */
  async getFeed(page = 1, size = PAGINATION.PAGE_SIZE) {
    try {
      const response = await api.get(ENDPOINTS.POSTS_FEED, {
        params: { page, size }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Get trending posts
   */
  async getTrendingPosts(page = 1, size = PAGINATION.PAGE_SIZE) {
    try {
      const response = await api.get(ENDPOINTS.POSTS_TRENDING, {
        params: { page, size }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Create new post
   */
  async createPost(postData) {
    try {
      const response = await api.post(ENDPOINTS.POSTS, postData);
      
      return {
        success: true,
        data: response.data,
        message: 'Post created successfully'
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Get specific post
   */
  async getPost(postId) {
    try {
      const response = await api.get(`${ENDPOINTS.POSTS}/${postId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Update post
   */
  async updatePost(postId, postData) {
    try {
      const response = await api.put(`${ENDPOINTS.POSTS}/${postId}`, postData);
      
      return {
        success: true,
        data: response.data,
        message: 'Post updated successfully'
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Delete post
   */
  async deletePost(postId) {
    try {
      const response = await api.delete(`${ENDPOINTS.POSTS}/${postId}`);
      
      return {
        success: true,
        message: 'Post deleted successfully'
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Like post
   */
  async likePost(postId) {
    try {
      const url = apiUtils.formatUrl(ENDPOINTS.POSTS_LIKE, { id: postId });
      const response = await api.post(url);
      
      return {
        success: true,
        message: 'Post liked'
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Unlike post
   */
  async unlikePost(postId) {
    try {
      const url = apiUtils.formatUrl(ENDPOINTS.POSTS_LIKE, { id: postId });
      const response = await api.delete(url);
      
      return {
        success: true,
        message: 'Post unliked'
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Search posts
   */
  async searchPosts(query, page = 1, size = PAGINATION.PAGE_SIZE) {
    try {
      const response = await api.get(ENDPOINTS.POSTS_SEARCH, {
        params: { q: query, page, size }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Get post comments
   */
  async getPostComments(postId, page = 1, size = PAGINATION.PAGE_SIZE) {
    try {
      const url = apiUtils.formatUrl(ENDPOINTS.COMMENTS, { postId });
      const response = await api.get(url, {
        params: { page, size }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Create comment
   */
  async createComment(postId, commentData) {
    try {
      const url = apiUtils.formatUrl(ENDPOINTS.COMMENTS, { postId });
      const response = await api.post(url, commentData);
      
      return {
        success: true,
        data: response.data,
        message: 'Comment added'
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId) {
    try {
      const url = apiUtils.formatUrl(ENDPOINTS.DELETE_COMMENT, { id: commentId });
      const response = await api.delete(url);
      
      return {
        success: true,
        message: 'Comment deleted'
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }
}

// Export singleton instance
export default new PostService();