// web/src/services/postService.js - FIXED VERSION
import api from './api';

class PostService {
  // Get user feed
  async getFeed(page = 1, size = 20) {
    try {
      console.log(`📰 Fetching feed (page ${page}, size ${size})`);
      const response = await api.get(`/posts/feed?page=${page}&size=${size}`);
      console.log(`✅ Feed fetched: ${response.data.posts?.length || 0} posts`);
      
      return {
        posts: response.data.posts,
        total: response.data.total,
        hasNext: response.data.has_next,
        success: true
      };
    } catch (error) {
      console.error('❌ Error fetching feed:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch feed');
    }
  }

  // Get trending posts
  async getTrendingPosts(page = 1, size = 20, hoursWindow = 72) {
    try {
      console.log(`🔥 Fetching trending posts (${hoursWindow}h window, page ${page})`);
      const response = await api.get(`/posts/trending?page=${page}&size=${size}&hours_window=${hoursWindow}`);
      console.log('✅ Trending posts fetched:', response.data);
      
      return {
        posts: response.data.posts,
        total: response.data.total,
        hasNext: response.data.has_next,
        success: true
      };
    } catch (error) {
      console.error('❌ Error fetching trending posts:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch trending posts');
    }
  }

  // Get trending hashtags - ENHANCED FOR TRENDING PAGE
  async getTrendingHashtags(limit = 10) {
    try {
      console.log(`🏷️ Fetching trending hashtags (limit: ${limit})`);
      const response = await api.get(`/posts/trending/hashtags?limit=${limit}`);
      console.log('✅ Trending hashtags fetched:', response.data);
      
      return {
        hashtags: response.data.hashtags || response.data.trending_hashtags,
        total: response.data.total,
        success: response.data.success || true,
      };
    } catch (error) {
      console.error('❌ Error fetching trending hashtags:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch trending hashtags');
    }
  }

  // Create new post
  async createPost(postData) {
    try {
      console.log('📝 Creating new post:', postData);
      const response = await api.post('/posts', {
        content: postData.content,
        media_urls: postData.media_urls || [],
        hashtags: postData.hashtags || []
      });
      console.log('✅ Post created successfully:', response.data);
      
      return {
        post: response.data,
        success: true
      };
    } catch (error) {
      console.error('❌ Create post error:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to create post');
    }
  }

  // Get post by ID - ENHANCED FOR POST DETAIL PAGE
  async getPostById(postId) {
    try {
      console.log(`🔍 Fetching post by ID: ${postId}`);
      const response = await api.get(`/posts/${postId}`);
      console.log('✅ Post fetched successfully:', response.data);
      
      return {
        post: response.data,
        success: true
      };
    } catch (error) {
      console.error(`❌ Error fetching post ${postId}:`, error);
      
      if (error.response?.status === 404) {
        throw new Error('Post not found');
      }
      
      throw new Error(error.response?.data?.detail || 'Failed to fetch post');
    }
  }

  // Like a post - ENHANCED WITH BETTER ERROR HANDLING
  async likePost(postId) {
    try {
      console.log(`❤️ Liking post: ${postId}`);
      const response = await api.post(`/posts/${postId}/like`);
      console.log('✅ Post liked successfully:', response.data);
      
      return {
        success: response.data.success || true,
        liked: response.data.liked || true,
        likes_count: response.data.likes_count
      };
    } catch (error) {
      console.error(`❌ Like post error for ${postId}:`, error.response?.data);
      
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('already liked')) {
        // Already liked - return current state
        return {
          success: true,
          liked: true,
          likes_count: null // Will be updated from state
        };
      }
      
      throw new Error(error.response?.data?.detail || 'Failed to like post');
    }
  }

  // Unlike a post - ENHANCED WITH BETTER ERROR HANDLING
  async unlikePost(postId) {
    try {
      console.log(`💔 Unliking post: ${postId}`);
      const response = await api.delete(`/posts/${postId}/like`);
      console.log('✅ Post unliked successfully:', response.data);
      
      return {
        success: response.data.success || true,
        liked: response.data.liked || false,
        likes_count: response.data.likes_count
      };
    } catch (error) {
      console.error(`❌ Unlike post error for ${postId}:`, error.response?.data);
      
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('not liked')) {
        // Not liked - return current state
        return {
          success: true,
          liked: false,
          likes_count: null // Will be updated from state
        };
      }
      
      throw new Error(error.response?.data?.detail || 'Failed to unlike post');
    }
  }

  // Search posts - ENHANCED
  async searchPosts(query, page = 1, size = 20) {
    try {
      console.log(`🔍 Searching posts: "${query}" (page ${page})`);
      const response = await api.get(`/posts/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
      console.log(`✅ Search completed: ${response.data.posts?.length || 0} results`);
      
      return {
        posts: response.data.posts,
        total: response.data.total,
        hasNext: response.data.has_next,
        success: true
      };
    } catch (error) {
      console.error('❌ Error searching posts:', error);
      throw new Error(error.response?.data?.detail || 'Failed to search posts');
    }
  }

  // Update post
  async updatePost(postId, postData) {
    try {
      console.log(`✏️ Updating post ${postId}:`, postData);
      const response = await api.put(`/posts/${postId}`, postData);
      console.log('✅ Post updated successfully:', response.data);
      
      return {
        post: response.data,
        success: true
      };
    } catch (error) {
      console.error(`❌ Error updating post ${postId}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to update post');
    }
  }

  // Delete post
  async deletePost(postId) {
    try {
      console.log(`🗑️ Deleting post: ${postId}`);
      await api.delete(`/posts/${postId}`);
      console.log('✅ Post deleted successfully');
      
      return {
        success: true,
        message: 'Post deleted successfully'
      };
    } catch (error) {
      console.error(`❌ Error deleting post ${postId}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to delete post');
    }
  }

  // Get post comments - ENHANCED FOR COMMENT SYSTEM
  async getPostComments(postId, page = 1, size = 50) {
    try {
      console.log(`💬 Fetching comments for post ${postId} (page ${page})`);
      const response = await api.get(`/posts/${postId}/comments?page=${page}&size=${size}`);
      console.log(`✅ Comments fetched: ${response.data.comments?.length || 0} comments`);
      
      return {
        comments: response.data.comments || [],
        total: response.data.total || 0,
        hasNext: response.data.has_next || false,
        success: true
      };
    } catch (error) {
      console.error(`❌ Error fetching comments for post ${postId}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch comments');
    }
  }

  // Add comment to post - ENHANCED FOR COMMENT SYSTEM
  async addComment(postId, content) {
    try {
      console.log(`💬 Adding comment to post ${postId}:`, content);
      const response = await api.post(`/posts/${postId}/comments`, { 
        content: content.trim() 
      });
      console.log('✅ Comment added successfully:', response.data);
      
      return {
        comment: response.data,
        success: true
      };
    } catch (error) {
      console.error(`❌ Error adding comment to post ${postId}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to add comment');
    }
  }

  // Bookmark post - NEW FEATURE
  async bookmarkPost(postId) {
    try {
      console.log(`🔖 Bookmarking post: ${postId}`);
      const response = await api.post(`/posts/${postId}/bookmark`);
      console.log('✅ Post bookmarked successfully:', response.data);
      
      return {
        success: response.data.success || true,
        bookmarked: response.data.bookmarked || true,
        message: response.data.message
      };
    } catch (error) {
      console.error(`❌ Error bookmarking post ${postId}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to bookmark post');
    }
  }

  // Unbookmark post - NEW FEATURE
  async unbookmarkPost(postId) {
    try {
      console.log(`🔖 Unbookmarking post: ${postId}`);
      const response = await api.delete(`/posts/${postId}/bookmark`);
      console.log('✅ Post unbookmarked successfully:', response.data);
      
      return {
        success: response.data.success || true,
        bookmarked: response.data.bookmarked || false,
        message: response.data.message
      };
    } catch (error) {
      console.error(`❌ Error unbookmarking post ${postId}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to unbookmark post');
    }
  }

  // Share post - NEW FEATURE
  async sharePost(postId) {
    try {
      console.log(`📤 Sharing post: ${postId}`);
      const response = await api.post(`/posts/${postId}/share`);
      console.log('✅ Post shared successfully:', response.data);
      
      return {
        success: response.data.success || true,
        shares_count: response.data.shares_count,
        message: response.data.message
      };
    } catch (error) {
      console.error(`❌ Error sharing post ${postId}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to share post');
    }
  }

  // Get user's posts - UTILITY METHOD
  async getUserPosts(userId, page = 1, size = 20) {
    try {
      console.log(`👤 Fetching posts for user ${userId} (page ${page})`);
      const response = await api.get(`/users/${userId}/posts?page=${page}&size=${size}`);
      console.log(`✅ User posts fetched: ${response.data.posts?.length || 0} posts`);
      
      return {
        posts: response.data.posts || [],
        total: response.data.total || 0,
        hasNext: response.data.has_next || false,
        success: true
      };
    } catch (error) {
      console.error(`❌ Error fetching posts for user ${userId}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch user posts');
    }
  }

  // Get post analytics - FUTURE FEATURE
  async getPostAnalytics(postId) {
    try {
      console.log(`📊 Fetching analytics for post ${postId}`);
      const response = await api.get(`/posts/${postId}/analytics`);
      console.log('✅ Post analytics fetched:', response.data);
      
      return {
        analytics: response.data,
        success: true
      };
    } catch (error) {
      console.error(`❌ Error fetching analytics for post ${postId}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch post analytics');
    }
  }

  // Report post - MODERATION FEATURE
  async reportPost(postId, reason) {
    try {
      console.log(`🚨 Reporting post ${postId} for: ${reason}`);
      const response = await api.post(`/posts/${postId}/report`, { reason });
      console.log('✅ Post reported successfully:', response.data);
      
      return {
        success: response.data.success || true,
        message: response.data.message || 'Post reported successfully'
      };
    } catch (error) {
      console.error(`❌ Error reporting post ${postId}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to report post');
    }
  }
}

// Export singleton instance
const postService = new PostService();
export { postService };
export default postService;