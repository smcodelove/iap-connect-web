/**
 * Simplified Redux slice for search functionality
 * Handles search state and basic search operations
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Search query and active tab
  currentQuery: '',
  activeFilter: 'all', // 'all', 'posts', 'users', 'hashtags'
  
  // Search results
  userResults: [],
  postResults: [],
  hashtagResults: [],
  
  // Discovery content
  trendingHashtags: [
    { tag: '#MedicalEducation', posts: 245, growth: '+12%' },
    { tag: '#Surgery', posts: 189, growth: '+8%' },
    { tag: '#Cardiology', posts: 167, growth: '+15%' },
    { tag: '#Neurology', posts: 143, growth: '+6%' },
    { tag: '#Pediatrics', posts: 134, growth: '+10%' },
    { tag: '#Innovation', posts: 129, growth: '+5%' },
  ],
  
  suggestedUsers: [
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
  ],
  
  // Search history and suggestions
  searchHistory: [
    '#cardiology', 
    '#surgery', 
    '#pediatrics', 
    '#neurology', 
    'medical education'
  ],
  
  // Loading states
  loading: false,
  userLoading: false,
  
  // UI state
  searchFocused: false,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // Set current search query
    setCurrentQuery: (state, action) => {
      state.currentQuery = action.payload;
    },

    // Set active filter
    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set user loading state
    setUserLoading: (state, action) => {
      state.userLoading = action.payload;
    },

    // Set user results
    setUserResults: (state, action) => {
      state.userResults = action.payload;
    },

    // Set post results
    setPostResults: (state, action) => {
      state.postResults = action.payload;
    },

    // Clear search results
    clearSearchResults: (state) => {
      state.userResults = [];
      state.postResults = [];
      state.hashtagResults = [];
      state.currentQuery = '';
    },

    // Set search focus state
    setSearchFocused: (state, action) => {
      state.searchFocused = action.payload;
    },

    // Add to search history
    addToSearchHistory: (state, action) => {
      const query = action.payload;
      state.searchHistory = [
        query,
        ...state.searchHistory.filter(item => item !== query)
      ].slice(0, 10);
    },

    // Clear search history
    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },

    // Update user follow status in results
    updateUserFollowStatus: (state, action) => {
      const { userId, isFollowing } = action.payload;
      
      // Update in user results
      state.userResults = state.userResults.map(user =>
        user.id === userId ? { ...user, is_following: isFollowing } : user
      );
      
      // Update in suggested users
      state.suggestedUsers = state.suggestedUsers.map(user =>
        user.id === userId ? { ...user, is_following: isFollowing } : user
      );
    },

    // Set suggested users
    setSuggestedUsers: (state, action) => {
      state.suggestedUsers = action.payload;
    },

    // Set trending hashtags
    setTrendingHashtags: (state, action) => {
      state.trendingHashtags = action.payload;
    },

    // Reset search state
    resetSearchState: (state) => {
      return initialState;
    }
  }
});

// Export actions (MOVED AFTER searchSlice creation)
export const {
  setCurrentQuery,
  setActiveFilter,
  setLoading,
  setUserLoading,
  setUserResults,
  setPostResults,
  clearSearchResults,
  setSearchFocused,
  addToSearchHistory,
  clearSearchHistory,
  updateUserFollowStatus,
  setSuggestedUsers,
  setTrendingHashtags,
  resetSearchState
} = searchSlice.actions;

// Selectors
export const selectCurrentQuery = (state) => state.search.currentQuery;
export const selectActiveFilter = (state) => state.search.activeFilter;
export const selectUserResults = (state) => state.search.userResults;
export const selectPostResults = (state) => state.search.postResults;
export const selectTrendingHashtags = (state) => state.search.trendingHashtags;
export const selectSuggestedUsers = (state) => state.search.suggestedUsers;
export const selectSearchHistory = (state) => state.search.searchHistory;
export const selectLoading = (state) => state.search.loading;
export const selectUserLoading = (state) => state.search.userLoading;
export const selectSearchFocused = (state) => state.search.searchFocused;

// Complex selectors
export const selectHasResults = (state) => {
  const { userResults, postResults } = state.search;
  return userResults.length > 0 || postResults.length > 0;
};

export const selectIsSearching = (state) => {
  return state.search.loading || state.search.userLoading;
};

export default searchSlice.reducer;