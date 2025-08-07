// web/src/services/commentService.js - STANDALONE COMMENT SERVICE
/**
 * Dedicated comment service for IAP Connect
 * Handles all comment-related API operations
 * FIXED: Proper function exports and error handling
 */

import api from './api';

class CommentService {
  constructor() {
    console.log('💬 CommentService initialized');
  }

  // Get comments for a post - FIXED method name
  async getPostComments(postId, page = 1, size = 50) {
    try {
      console.log(`💬 Getting comments for post ${postId}, page ${page}, size ${size}`);
      
      const response = await api.get(`/posts/${postId}/comments?page=${page}&size=${size}`);
      
      console.log(`✅ Comments fetched: ${response.data.comments?.length || 0} comments`);
      
      return {
        success: true,
        comments: response.data.comments || [],
        total: response.data.total || 0,
        page: page,
        has_next: response.data.has_next || false
      };
    } catch (error) {
      console.error('❌ Failed to get comments:', error);
      return {
        success: false,
        comments: [],
        total: 0,
        page: 1,
        has_next: false,
        error: error.message
      };
    }
  }

  // Alternative method name for compatibility
  async getComments(postId, page = 1, size = 50) {
    return this.getPostComments(postId, page, size);
  }

  // Add comment to a post - FIXED endpoint
  async addComment(postId, content, parentId = null) {
    try {
      console.log(`💬 Adding comment to post ${postId}:`, { content, parentId });
      
      const response = await api.post(`/posts/${postId}/comments`, {
        content: content,
        parent_id: parentId
      });
      
      console.log('✅ Comment added successfully:', response.data);
      
      return {
        success: true,
        comment: response.data
      };
    } catch (error) {
      console.error('❌ Failed to add comment:', error);
      throw new Error(error.response?.data?.detail || 'Failed to add comment');
    }
  }

  // Create comment (alternative method name)
  async createComment(postId, content, parentId = null) {
    return this.addComment(postId, content, parentId);
  }

  // Like a comment
  async likeComment(commentId) {
    try {
      console.log(`❤️ Liking comment ${commentId}`);
      
      const response = await api.post(`/posts/comments/${commentId}/like`);
      
      return {
        success: true,
        liked: true,
        likes_count: response.data.likes_count
      };
    } catch (error) {
      console.error('❌ Failed to like comment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Unlike a comment
  async unlikeComment(commentId) {
    try {
      console.log(`💔 Unliking comment ${commentId}`);
      
      const response = await api.delete(`/posts/comments/${commentId}/like`);
      
      return {
        success: true,
        liked: false,
        likes_count: response.data.likes_count
      };
    } catch (error) {
      console.error('❌ Failed to unlike comment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Toggle like/unlike comment
  async toggleLike(commentId, isLiked = false) {
    if (isLiked) {
      return this.unlikeComment(commentId);
    } else {
      return this.likeComment(commentId);
    }
  }

  // Update comment
  async updateComment(commentId, content) {
    try {
      console.log(`✏️ Updating comment ${commentId}`);
      
      const response = await api.put(`/posts/comments/${commentId}`, { content });
      
      return {
        success: true,
        comment: response.data
      };
    } catch (error) {
      console.error('❌ Failed to update comment:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update comment');
    }
  }

  // Delete comment
  async deleteComment(commentId) {
    try {
      console.log(`🗑️ Deleting comment ${commentId}`);
      
      const response = await api.delete(`/posts/comments/${commentId}`);
      
      return {
        success: true,
        message: response.data.message || 'Comment deleted successfully'
      };
    } catch (error) {
      console.error('❌ Failed to delete comment:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  }

  // Get replies for a comment
  async getReplies(commentId, page = 1, size = 20) {
    try {
      console.log(`💬 Getting replies for comment ${commentId}`);
      
      const response = await api.get(`/posts/comments/${commentId}/replies?page=${page}&size=${size}`);
      
      return {
        success: true,
        comments: response.data.comments || [],
        total: response.data.total || 0
      };
    } catch (error) {
      console.error('❌ Failed to get comment replies:', error);
      return {
        success: false,
        comments: [],
        total: 0,
        error: error.message
      };
    }
  }
}

// Create and export service instance
const commentService = new CommentService();

export default commentService;
export { commentService };