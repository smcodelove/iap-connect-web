/**
 * User Redux slice for IAP Connect mobile app
 * Manages user-related state and actions
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

// Initial state
const initialState = {
  searchResults: [],
  currentUserProfile: null,
  loading: false,
  error: null,
  searchLoading: false
};

// Async thunks
export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (query, { rejectWithValue }) => {
    try {
      const response = await userService.searchUsers(query);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'users/getUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.getUserProfile(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const followUser = createAsyncThunk(
  'users/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.followUser(userId);
      return { userId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'users/unfollowUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.unfollowUser(userId);
      return { userId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearCurrentUserProfile: (state) => {
      state.currentUserProfile = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.data;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      })

      // Get User Profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUserProfile = action.payload.data;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Follow User
      .addCase(followUser.fulfilled, (state, action) => {
        const userId = action.payload.userId;
        
        // Update current user profile if it matches
        if (state.currentUserProfile && state.currentUserProfile.id === userId) {
          state.currentUserProfile.followers_count += 1;
          state.currentUserProfile.is_following = true;
        }
        
        // Update in search results
        const searchUser = state.searchResults.find(user => user.id === userId);
        if (searchUser) {
          searchUser.is_following = true;
        }
      })

      // Unfollow User
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const userId = action.payload.userId;
        
        // Update current user profile if it matches
        if (state.currentUserProfile && state.currentUserProfile.id === userId) {
          state.currentUserProfile.followers_count = Math.max(0, state.currentUserProfile.followers_count - 1);
          state.currentUserProfile.is_following = false;
        }
        
        // Update in search results
        const searchUser = state.searchResults.find(user => user.id === userId);
        if (searchUser) {
          searchUser.is_following = false;
        }
      });
  }
});

// Export actions
export const { clearError, clearSearchResults, clearCurrentUserProfile } = userSlice.actions;

// Selectors
export const selectUsers = (state) => state.users;
export const selectSearchResults = (state) => state.users.searchResults;
export const selectCurrentUserProfile = (state) => state.users.currentUserProfile;
export const selectUsersLoading = (state) => state.users.loading;
export const selectSearchLoading = (state) => state.users.searchLoading;
export const selectUsersError = (state) => state.users.error;

// Export reducer
export default userSlice.reducer;