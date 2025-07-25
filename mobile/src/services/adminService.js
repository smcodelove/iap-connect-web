// mobile/src/services/adminService.js
/**
 * Admin service for IAP Connect mobile app
 * Handles all admin-related API calls for dashboard and user management
 */

import api from './api';
import { ENDPOINTS } from '../utils/constants';

class AdminService {
  // Get admin dashboard statistics
  async getDashboardStats() {
    try {
      console.log('📊 Fetching admin dashboard stats...');
      const response = await api.get(ENDPOINTS.ADMIN_DASHBOARD);
      console.log('✅ Dashboard stats fetched:', response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch dashboard statistics');
    }
  }

  // Get all users (admin only)
  async getAllUsers(page = 1, size = 50, search = '') {
    try {
      console.log('👥 Fetching all users for admin...');
      const params = {
        page,
        size,
        ...(search && { search })
      };

      const response = await api.get(ENDPOINTS.ADMIN_USERS, { params });
      console.log('✅ Users fetched for admin:', response.data);
      
      return {
        success: true,
        users: response.data,
        pagination: {
          page,
          size,
          total: response.data.length // Backend should provide total count
        }
      };
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch users');
    }
  }

  // Delete user (admin only)
  async deleteUser(userId) {
    try {
      console.log(`🗑️ Deleting user ${userId}...`);
      const response = await api.delete(`${ENDPOINTS.ADMIN_DELETE_USER}/${userId}`);
      console.log('✅ User deleted successfully:', response.data);
      
      return {
        success: true,
        message: response.data.message || 'User deleted successfully'
      };
    } catch (error) {
      console.error(`❌ Error deleting user ${userId}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to delete user');
    }
  }

  // Delete post (admin only)
  async deletePost(postId) {
    try {
      console.log(`🗑️ Deleting post ${postId}...`);
      const response = await api.delete(`${ENDPOINTS.ADMIN_DELETE_POST}/${postId}`);
      console.log('✅ Post deleted successfully:', response.data);
      
      return {
        success: true,
        message: response.data.message || 'Post deleted successfully'
      };
    } catch (error) {
      console.error(`❌ Error deleting post ${postId}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to delete post');
    }
  }

  // Search users with advanced filters (admin only)
  async searchUsersAdvanced(filters) {
    try {
      const {
        query = '',
        userType,
        page = 1,
        size = 50,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = filters;

      console.log('🔍 Advanced user search by admin:', filters);

      const params = {
        page,
        size,
        ...(query && { search: query }),
        ...(userType && { user_type: userType }),
        sort_by: sortBy,
        sort_order: sortOrder
      };

      const response = await api.get(ENDPOINTS.ADMIN_USERS, { params });
      console.log('✅ Advanced user search completed:', response.data);
      
      return {
        success: true,
        users: response.data,
        filters: filters
      };
    } catch (error) {
      console.error('❌ Error in advanced user search:', error);
      throw new Error(error.response?.data?.detail || 'Failed to search users');
    }
  }

  // Get platform analytics
  async getPlatformAnalytics(period = '30d') {
    try {
      console.log(`📈 Fetching platform analytics for ${period}...`);
      
      // For now, we'll use dashboard endpoint
      // In future, backend can have dedicated analytics endpoint
      const response = await api.get(ENDPOINTS.ADMIN_DASHBOARD);
      
      // Process data for analytics
      const analytics = {
        userGrowth: {
          total: response.data.user_stats.total_users,
          doctors: response.data.user_stats.total_doctors,
          students: response.data.user_stats.total_students,
          activeUsers: response.data.user_stats.active_users
        },
        contentStats: {
          totalPosts: response.data.content_stats.total_posts,
          totalComments: response.data.content_stats.total_comments,
          totalLikes: response.data.content_stats.total_likes,
          avgEngagement: response.data.engagement_metrics.avg_likes_per_post
        },
        topContent: response.data.top_posts,
        topUsers: response.data.most_followed_users
      };

      console.log('✅ Platform analytics processed:', analytics);
      
      return {
        success: true,
        data: analytics,
        period
      };
    } catch (error) {
      console.error('❌ Error fetching platform analytics:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch analytics');
    }
  }

  // Bulk actions for content moderation
  async bulkDeletePosts(postIds) {
    try {
      console.log('🗑️ Bulk deleting posts:', postIds);
      
      const deletePromises = postIds.map(postId => 
        this.deletePost(postId).catch(error => ({ error, postId }))
      );
      
      const results = await Promise.all(deletePromises);
      
      const successful = results.filter(result => !result.error);
      const failed = results.filter(result => result.error);
      
      console.log(`✅ Bulk delete completed: ${successful.length} successful, ${failed.length} failed`);
      
      return {
        success: true,
        successful: successful.length,
        failed: failed.length,
        errors: failed
      };
    } catch (error) {
      console.error('❌ Error in bulk delete posts:', error);
      throw new Error('Failed to perform bulk delete operation');
    }
  }

  // Generate admin report
  async generateReport(reportType = 'overview') {
    try {
      console.log(`📄 Generating ${reportType} report...`);
      
      const dashboardData = await this.getDashboardStats();
      
      const report = {
        type: reportType,
        generatedAt: new Date().toISOString(),
        summary: {
          totalUsers: dashboardData.data.user_stats.total_users,
          totalPosts: dashboardData.data.content_stats.total_posts,
          engagement: dashboardData.data.engagement_metrics,
          userDistribution: {
            doctors: dashboardData.data.user_stats.total_doctors,
            students: dashboardData.data.user_stats.total_students,
            admins: dashboardData.data.user_stats.total_admins
          }
        },
        details: dashboardData.data
      };
      
      console.log('✅ Report generated successfully:', report);
      
      return {
        success: true,
        report
      };
    } catch (error) {
      console.error('❌ Error generating report:', error);
      throw new Error(error.response?.data?.detail || 'Failed to generate report');
    }
  }

  // Admin notifications/alerts
  async getAdminAlerts() {
    try {
      console.log('🔔 Fetching admin alerts...');
      
      // For now, we'll generate alerts based on dashboard data
      const dashboardData = await this.getDashboardStats();
      const data = dashboardData.data;
      
      const alerts = [];
      
      // Check for low engagement
      if (data.engagement_metrics.avg_likes_per_post < 1) {
        alerts.push({
          type: 'warning',
          message: 'Low average engagement detected',
          value: data.engagement_metrics.avg_likes_per_post,
          action: 'Review content strategy'
        });
      }
      
      // Check for inactive users
      const inactiveRate = (data.user_stats.total_users - data.user_stats.active_users) / data.user_stats.total_users;
      if (inactiveRate > 0.3) {
        alerts.push({
          type: 'danger',
          message: 'High inactive user rate',
          value: `${(inactiveRate * 100).toFixed(1)}%`,
          action: 'Consider re-engagement campaign'
        });
      }
      
      // Check for content imbalance
      if (data.content_stats.total_posts > 0 && data.content_stats.total_comments / data.content_stats.total_posts < 0.5) {
        alerts.push({
          type: 'info',
          message: 'Low comment-to-post ratio',
          value: (data.content_stats.total_comments / data.content_stats.total_posts).toFixed(2),
          action: 'Encourage community discussion'
        });
      }
      
      console.log('✅ Admin alerts generated:', alerts);
      
      return {
        success: true,
        alerts
      };
    } catch (error) {
      console.error('❌ Error fetching admin alerts:', error);
      throw new Error('Failed to fetch admin alerts');
    }
  }

  // Verify admin privileges
  async verifyAdminAccess() {
    try {
      console.log('🔐 Verifying admin access...');
      
      // This will be handled by the API interceptor
      // but we can add extra verification here
      const response = await api.get('/auth/me');
      
      if (response.data.user_type !== 'admin') {
        throw new Error('Insufficient privileges');
      }
      
      console.log('✅ Admin access verified');
      
      return {
        success: true,
        user: response.data
      };
    } catch (error) {
      console.error('❌ Admin access verification failed:', error);
      throw new Error('Admin access verification failed');
    }
  }
}

export default new AdminService();