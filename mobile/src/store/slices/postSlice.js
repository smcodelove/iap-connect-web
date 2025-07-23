/**
 * Post Redux slice for IAP Connect mobile app
 * Manages posts state and actions
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postService from '../../services/postService';

// Initial state
const initialState = {
  feed: [],
  trending: [],
  userPosts: [],
  currentPost: null,
  loading: false,
  error: null,
  feedPagination: {
    page: 1,
    hasNext: true,
    loading: false
  },
  trendingPagination: {
    page: 1,
    hasNext: true,
    loading: false
  }
};

// Async thunks
export const getFeed = createAsyncThunk(
  'posts/getFeed',
  async ({ page = 1, refresh = false }, { rejectWithValue }) => {
    try {
      const response = await postService.getFeed(page);
      return { ...response, page, refresh };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTrendingPosts = createAsyncThunk(
  'posts/getTrendingPosts',
  async ({ page = 1, refresh = false }, { rejectWithValue }) => {
    try {
      const response = await postService.getTrendingPosts(page);
      return { ...response, page, refresh };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await postService.createPost(postData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postService.likePost(postId);
      return { postId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const unlikePost = createAsyncThunk(
  'posts/unlikePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postService.unlikePost(postId);
      return { postId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPost = createAsyncThunk(
  'posts/getPost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postService.getPost(postId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postService.deletePost(postId);
      return { postId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchPosts = createAsyncThunk(
  'posts/searchPosts',
  async ({ query, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await postService.searchPosts(query, page);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Post slice
const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    updatePostInLists: (state, action) => {
      const { postId, updates } = action.payload;
      
      // Update in feed
      const feedIndex = state.feed.findIndex(post => post.id === postId);
      if (feedIndex !== -1) {
        state.feed[feedIndex] = { ...state.feed[feedIndex], ...updates };
      }
      
      // Update in trending
      const trendingIndex = state.trending.findIndex(post => post.id === postId);
      if (trendingIndex !== -1) {
        state.trending[trendingIndex] = { ...state.trending[trendingIndex], ...updates };
      }
      
      // Update current post if it matches
      if (state.currentPost && state.currentPost.id === postId) {
        state.currentPost = { ...state.currentPost, ...updates };
      }
    },
    removePostFromLists: (state, action) => {
      const postId = action.payload;
      
      // Remove from feed
      state.feed = state.feed.filter(post => post.id !== postId);
      
      // Remove from trending
      state.trending = state.trending.filter(post => post.id !== postId);
      
      // Clear current post if it matches
      if (state.currentPost && state.currentPost.id === postId) {
        state.currentPost = null;
      }
    },
    resetFeed: (state) => {
      state.feed = [];
      state.feedPagination = {
        page: 1,
        hasNext: true,
        loading: false
      };
    },
    resetTrending: (state) => {
      state.trending = [];
      state.trendingPagination = {
        page: 1,
        hasNext: true,
        loading: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Feed
      .addCase(getFeed.pending, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.loading = true;
        }
        state.feedPagination.loading = true;
        state.error = null;
      })
      .addCase(getFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.feedPagination.loading = false;
        
        if (action.payload.refresh || action.payload.page === 1) {
          state.feed = action.payload.data.posts;
        } else {
          state.feed = [...state.feed, ...action.payload.data.posts];
        }
        
        state.feedPagination = {
          page: action.payload.page,
          hasNext: action.payload.data.has_next,
          loading: false
        };
      })
      .addCase(getFeed.rejected, (state, action) => {
        state.loading = false;
        state.feedPagination.loading = false;
        state.error = action.payload;
      })

      // Get Trending Posts
      .addCase(getTrendingPosts.pending, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.loading = true;
        }
        state.trendingPagination.loading = true;
        state.error = null;
      })
      .addCase(getTrendingPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.trendingPagination.loading = false;
        
        if (action.payload.refresh || action.payload.page === 1) {
          state.trending = action.payload.data.posts;
        } else {
          state.trending = [...state.trending, ...action.payload.data.posts];
        }
        
        state.trendingPagination = {
          page: action.payload.page,
          hasNext: action.payload.data.has_next,
          loading: false
        };
      })
      .addCase(getTrendingPosts.rejected, (state, action) => {
        state.loading = false;
        state.trendingPagination.loading = false;
        state.error = action.payload;
      })

      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        // Add new post to the beginning of feed
        state.feed.unshift(action.payload.data);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const postId = action.payload.postId;
        
        // Update like status in all lists
        [state.feed, state.trending].forEach(list => {
          const post = list.find(p => p.id === postId);
          if (post) {
            post.is_liked = true;
            post.likes_count += 1;
          }
        });
        
        // Update current post
        if (state.currentPost && state.currentPost.id === postId) {
          state.currentPost.is_liked = true;
          state.currentPost.likes_count += 1;
        }
      })

      // Unlike Post
      .addCase(unlikePost.fulfilled, (state, action) => {
        const postId = action.payload.postId;
        
        // Update like status in all lists
        [state.feed, state.trending].forEach(list => {
          const post = list.find(p => p.id === postId);
          if (post) {
            post.is_liked = false;
            post.likes_count = Math.max(0, post.likes_count - 1);
          }
        });
        
        // Update current post
        if (state.currentPost && state.currentPost.id === postId) {
          state.currentPost.is_liked = false;
          state.currentPost.likes_count = Math.max(0, state.currentPost.likes_count - 1);
        }
      })

      // Get Post
      .addCase(getPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPost.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload.data;
      })
      .addCase(getPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.payload.postId;
        
        // Remove from all lists
        state.feed = state.feed.filter(post => post.id !== postId);
        state.trending = state.trending.filter(post => post.id !== postId);
        
        // Clear current post if it matches
        if (state.currentPost && state.currentPost.id === postId) {
          state.currentPost = null;
        }
      });
  }
});

// Export actions
export const {
  clearError,
  clearCurrentPost,
  updatePostInLists,
  removePostFromLists,
  resetFeed,
  resetTrending
} = postSlice.actions;

// Selectors
export const selectPosts = (state) => state.posts;
export const selectFeed = (state) => state.posts.feed;
export const selectTrending = (state) => state.posts.trending;
export const selectCurrentPost = (state) => state.posts.currentPost;
export const selectPostsLoading = (state) => state.posts.loading;
export const selectPostsError = (state) => state.posts.error;
export const selectFeedPagination = (state) => state.posts.feedPagination;
export const selectTrendingPagination = (state) => state.posts.trendingPagination;

// Export reducer
export default postSlice.reducer;