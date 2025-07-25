// store/slices/userSlice.js
/**
 * Redux slice for user management functionality
 * Handles user profiles, search, follow/unfollow state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../services/userService';

// Async Thunks for user operations

// Search users
export const searchUsers = createAsyncThunk(
  'user/searchUsers',
  async ({ query, options = {} }, { rejectWithValue }) => {
    try {
      const response = await userService.searchUsers(query, options);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to search users');
    }
  }
);

// Get user profile
export const getUserProfile = createAsyncThunk(
  'user/getUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const profile = await userService.getUserProfile(userId);
      return profile;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch user profile');
    }
  }
);

// Follow user
export const followUser = createAsyncThunk(
  'user/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.followUser(userId);
      return { userId, response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to follow user');
    }
  }
);

// Unfollow user
export const unfollowUser = createAsyncThunk(
  'user/unfollowUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.unfollowUser(userId);
      return { userId, response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to unfollow user');
    }
  }
);

// Get followers
export const getUserFollowers = createAsyncThunk(
  'user/getUserFollowers',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const followers = await userService.getUserFollowers(userId, page);
      return { userId, followers, page };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch followers');
    }
  }
);

// Get following
export const getUserFollowing = createAsyncThunk(
  'user/getUserFollowing',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const following = await userService.getUserFollowing(userId, page);
      return { userId, following, page };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch following');
    }
  }
);

// Get suggested users
export const getSuggestedUsers = createAsyncThunk(
  'user/getSuggestedUsers',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const users = await userService.getSuggestedUsers(limit);
      return users;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch suggested users');
    }
  }
);

const initialState = {
  // Search state
  searchResults: {
    users: [],
    total: 0,
    page: 1,
    per_page: 20,
    has_next: false,
    has_prev: false,
    loading: false,
    error: null,
    query: ''
  },

  // User profiles cache
  profiles: {},
  
  // Follow/Unfollow state
  followingUsers: [],
  followLoading: [],
  
  // Followers/Following lists
  userFollowers: {},
  userFollowing: {},
  
  // Suggested users
  suggestedUsers: [],
  suggestedUsersLoading: false,
  
  // UI state
  profileLoading: {},
  errors: {},
  
  // Current viewed profile
  currentProfile: null,
  currentProfileLoading: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = {
        ...initialState.searchResults
      };
    },

    // Set search query
    setSearchQuery: (state, action) => {
      state.searchResults.query = action.payload;
    },

    // Update user profile in cache
    updateUserProfile: (state, action) => {
      const { userId, updates } = action.payload;
      if (state.profiles[userId]) {
        state.profiles[userId] = {
          ...state.profiles[userId],
          ...updates
        };
      }
    },

    // Clear user profile from cache
    clearUserProfile: (state, action) => {
      const userId = action.payload;
      delete state.profiles[userId];
      delete state.profileLoading[userId];
      delete state.errors[userId];
    },

    // Set current profile
    setCurrentProfile: (state, action) => {
      state.currentProfile = action.payload;
    },

    // Clear all user data
    clearUserData: (state) => {
      return initialState;
    },

    // Update follow status locally (for optimistic updates)
    updateFollowStatus: (state, action) => {
      const { userId, isFollowing } = action.payload;
      
      if (isFollowing) {
        if (!state.followingUsers.includes(userId)) {
          state.followingUsers.push(userId);
        }
      } else {
        state.followingUsers = state.followingUsers.filter(id => id !== userId);
      }

      // Update in profiles cache
      if (state.profiles[userId]) {
        state.profiles[userId].is_following = isFollowing;
        state.profiles[userId].followers_count += isFollowing ? 1 : -1;
      }

      // Update in search results
      state.searchResults.users = state.searchResults.users.map(user => 
        user.id === userId 
          ? { ...user, is_following: isFollowing }
          : user
      );

      // Update current profile
      if (state.currentProfile && state.currentProfile.id === userId) {
        state.currentProfile.is_following = isFollowing;
        state.currentProfile.followers_count += isFollowing ? 1 : -1;
      }
    },

    // Remove user from lists (for block/report functionality)
    removeUserFromLists: (state, action) => {
      const userId = action.payload;
      
      // Remove from search results
      state.searchResults.users = state.searchResults.users.filter(
        user => user.id !== userId
      );
      
      // Remove from suggested users
      state.suggestedUsers = state.suggestedUsers.filter(
        user => user.id !== userId
      );
      
      // Clear from cache
      delete state.profiles[userId];
    }
  },

  extraReducers: (builder) => {
    // Search Users
    builder
      .addCase(searchUsers.pending, (state) => {
        state.searchResults.loading = true;
        state.searchResults.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchResults = {
          ...action.payload,
          loading: false,
          error: null
        };
        
        // Cache user profiles from search results
        action.payload.users.forEach(user => {
          state.profiles[user.id] = user;
          if (user.is_following) {
            if (!state.followingUsers.includes(user.id)) {
              state.followingUsers.push(user.id);
            }
          }
        });
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchResults.loading = false;
        state.searchResults.error = action.payload;
      });

    // Get User Profile
    builder
      .addCase(getUserProfile.pending, (state, action) => {
        const userId = action.meta.arg;
        state.profileLoading[userId] = true;
        state.currentProfileLoading = true;
        delete state.errors[userId];
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        const profile = action.payload;
        state.profiles[profile.id] = profile;
        state.currentProfile = profile;
        state.profileLoading[profile.id] = false;
        state.currentProfileLoading = false;
        
        if (profile.is_following) {
          if (!state.followingUsers.includes(profile.id)) {
            state.followingUsers.push(profile.id);
          }
        }
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        const userId = action.meta.arg;
        state.profileLoading[userId] = false;
        state.currentProfileLoading = false;
        state.errors[userId] = action.payload;
      });

    // Follow User
    builder
      .addCase(followUser.pending, (state, action) => {
        const userId = action.meta.arg;
        if (!state.followLoading.includes(userId)) {
          state.followLoading.push(userId);
        }
      })
      .addCase(followUser.fulfilled, (state, action) => {
        const { userId } = action.payload;
        state.followLoading = state.followLoading.filter(id => id !== userId);
        if (!state.followingUsers.includes(userId)) {
          state.followingUsers.push(userId);
        }
        
        // Update profiles cache
        if (state.profiles[userId]) {
          state.profiles[userId].is_following = true;
          state.profiles[userId].followers_count += 1;
        }

        // Update current profile
        if (state.currentProfile && state.currentProfile.id === userId) {
          state.currentProfile.is_following = true;
          state.currentProfile.followers_count += 1;
        }

        // Update search results
        state.searchResults.users = state.searchResults.users.map(user => 
          user.id === userId 
            ? { ...user, is_following: true, followers_count: user.followers_count + 1 }
            : user
        );
      })
      .addCase(followUser.rejected, (state, action) => {
        const userId = action.meta.arg;
        state.followLoading = state.followLoading.filter(id => id !== userId);
        state.errors[userId] = action.payload;
      })

     // Unfollow User
     builder
       .addCase(unfollowUser.pending, (state, action) => {
         const userId = action.meta.arg;
         if (!state.followLoading.includes(userId)) {
           state.followLoading.push(userId);
         }
       })
       .addCase(unfollowUser.fulfilled, (state, action) => {
         const { userId } = action.payload;
         state.followLoading = state.followLoading.filter(id => id !== userId);
         state.followingUsers = state.followingUsers.filter(id => id !== userId);
         
         // Update profiles cache
         if (state.profiles[userId]) {
           state.profiles[userId].is_following = false;
           state.profiles[userId].followers_count = Math.max(0, state.profiles[userId].followers_count - 1);
         }

         // Update current profile
         if (state.currentProfile && state.currentProfile.id === userId) {
           state.currentProfile.is_following = false;
           state.currentProfile.followers_count = Math.max(0, state.currentProfile.followers_count - 1);
         }

         // Update search results
         state.searchResults.users = state.searchResults.users.map(user => 
           user.id === userId 
             ? { ...user, is_following: false, followers_count: Math.max(0, user.followers_count - 1) }
             : user
         );
       })
       .addCase(unfollowUser.rejected, (state, action) => {
         const userId = action.meta.arg;
         state.followLoading = state.followLoading.filter(id => id !== userId);
         state.errors[userId] = action.payload;
       })

    // Get User Followers
    builder
      .addCase(getUserFollowers.fulfilled, (state, action) => {
        const { userId, followers, page } = action.payload;
        
        if (page === 1) {
          state.userFollowers[userId] = followers;
        } else {
          state.userFollowers[userId] = [
            ...(state.userFollowers[userId] || []),
            ...followers
          ];
        }
        
        // Cache follower profiles
        followers.forEach(user => {
          state.profiles[user.id] = user;
        });
      });

    // Get User Following
    builder
      .addCase(getUserFollowing.fulfilled, (state, action) => {
        const { userId, following, page } = action.payload;
        
        if (page === 1) {
          state.userFollowing[userId] = following;
        } else {
          state.userFollowing[userId] = [
            ...(state.userFollowing[userId] || []),
            ...following
          ];
        }
        
        // Cache following profiles
        following.forEach(user => {
          state.profiles[user.id] = user;
        });
      });

    // Get Suggested Users
    builder
      .addCase(getSuggestedUsers.pending, (state) => {
        state.suggestedUsersLoading = true;
      })
      .addCase(getSuggestedUsers.fulfilled, (state, action) => {
        state.suggestedUsers = action.payload;
        state.suggestedUsersLoading = false;
        
        // Cache suggested user profiles
        action.payload.forEach(user => {
          state.profiles[user.id] = user;
          if (user.is_following) {
            state.followingUsers.add(user.id);
          }
        });
      })
      .addCase(getSuggestedUsers.rejected, (state) => {
        state.suggestedUsersLoading = false;
      });
  }
});

// Export actions
export const {
  clearSearchResults,
  setSearchQuery,
  updateUserProfile,
  clearUserProfile,
  setCurrentProfile,
  clearUserData,
  updateFollowStatus,
  removeUserFromLists
} = userSlice.actions;

// Selectors
export const selectSearchResults = (state) => state.user.searchResults;
export const selectUserProfile = (userId) => (state) => state.user.profiles[userId];
export const selectCurrentProfile = (state) => state.user.currentProfile;
export const selectIsFollowing = (userId) => (state) => state.user.followingUsers.includes(userId);
export const selectFollowLoading = (userId) => (state) => state.user.followLoading.includes(userId);
export const selectProfileLoading = (userId) => (state) => state.user.profileLoading[userId] || false;
export const selectUserFollowers = (userId) => (state) => state.user.userFollowers[userId] || [];
export const selectUserFollowing = (userId) => (state) => state.user.userFollowing[userId] || [];
export const selectSuggestedUsers = (state) => state.user.suggestedUsers;
export const selectUserError = (userId) => (state) => state.user.errors[userId];

// Complex selectors
export const selectUserProfileWithFollowStatus = (userId) => (state) => {
  const profile = state.user.profiles[userId];
  if (!profile) return null;
  
  return {
    ...profile,
    is_following: state.user.followingUsers.includes(userId),
    follow_loading: state.user.followLoading.includes(userId)
  };
};

export const selectSearchResultsWithFollowStatus = (state) => {
  return {
    ...state.user.searchResults,
    users: state.user.searchResults.users.map(user => ({
      ...user,
      is_following: state.user.followingUsers.includes(user.id),
      follow_loading: state.user.followLoading.includes(user.id)
    }))
  };
};

export default userSlice.reducer;
