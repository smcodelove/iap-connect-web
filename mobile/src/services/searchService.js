// services/searchService.js
/**
 * Basic Search service for handling search-related API calls
 * Currently uses mock data, can be enhanced with real API calls later
 */

import api from './api';

class SearchService {
  // Search Users
  async searchUsers(query, options = {}) {
    try {
      // For now, return mock data
      // Later replace with: const response = await api.get('/users/search', { params: { q: query, ...options } });
      
      const mockUsers = [
        {
          id: 2,
          username: 'dr_patel',
          full_name: 'Dr. Priya Patel',
          user_type: 'doctor',
          specialty: 'Pediatrics',
          profile_picture_url: null,
          followers_count: 890,
          is_following: false
        },
        {
          id: 3,
          username: 'medical_student_raj',
          full_name: 'Raj Kumar',
          user_type: 'student',
          college: 'AIIMS Delhi',
          profile_picture_url: null,
          followers_count: 234,
          is_following: false
        },
        {
          id: 4,
          username: 'dr_singh',
          full_name: 'Dr. Amit Singh',
          user_type: 'doctor',
          specialty: 'Cardiology',
          profile_picture_url: null,
          followers_count: 1120,
          is_following: true
        }
      ];

      // Filter based on query
      const filteredUsers = mockUsers.filter(user => 
        user.full_name.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        (user.specialty && user.specialty.toLowerCase().includes(query.toLowerCase())) ||
        (user.college && user.college.toLowerCase().includes(query.toLowerCase()))
      );

      return {
        users: filteredUsers,
        total: filteredUsers.length,
        page: 1,
        per_page: 20,
        has_next: false,
        has_prev: false
      };
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Get Trending Hashtags
  async getTrendingHashtags(limit = 10) {
    try {
      // Mock trending hashtags
      const trendingHashtags = [
        { hashtag: '#MedicalEducation', posts_count: 245, growth: '+12%' },
        { hashtag: '#Surgery', posts_count: 189, growth: '+8%' },
        { hashtag: '#Cardiology', posts_count: 167, growth: '+15%' },
        { hashtag: '#Neurology', posts_count: 143, growth: '+6%' },
        { hashtag: '#Pediatrics', posts_count: 134, growth: '+10%' },
        { hashtag: '#Innovation', posts_count: 129, growth: '+5%' },
      ];

      return {
        success: true,
        trending_hashtags: trendingHashtags.slice(0, limit),
        total: trendingHashtags.length
      };
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
      throw error;
    }
  }

  // Get Suggested Users
  async getSuggestedUsers(limit = 10) {
    try {
      const suggestedUsers = [
        {
          id: 5,
          username: 'dr_sharma',
          full_name: 'Dr. Rajesh Sharma',
          user_type: 'doctor',
          specialty: 'Neurology',
          profile_picture_url: null,
          followers_count: 756,
          is_following: false
        },
        {
          id: 6,
          username: 'student_priya',
          full_name: 'Priya Sharma',
          user_type: 'student',
          college: 'JIPMER',
          profile_picture_url: null,
          followers_count: 123,
          is_following: false
        }
      ];

      return suggestedUsers.slice(0, limit);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      throw error;
    }
  }

  // Save Search History (Local Storage)
  async saveSearchQuery(query) {
    try {
      // In a real app, you might want to save this to AsyncStorage
      // For now, just return the query
      return query;
    } catch (error) {
      console.error('Error saving search query:', error);
      return null;
    }
  }

  // Get Popular Searches
  getPopularSearches() {
    return [
      'cardiology',
      'medical education',
      'surgery',
      'pediatrics',
      'neurology',
      'radiology'
    ];
  }
}

// Export singleton instance
const searchService = new SearchService();
export { searchService };