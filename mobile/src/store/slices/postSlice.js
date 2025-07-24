// store/slices/postSlice.js - Enhanced Post Redux slice with Trending functionality
/**
 * Enhanced Post Redux slice with Trending functionality
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
  },
  searchResults: [],
  searching: false
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
  async ({ page = 1, refresh = false, hours_window = 72 }, { rejectWithValue }) => {
    try {
      const response = await postService.getTrendingPosts(page, hours_window);
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
  async ({ postId }, { rejectWithValue }) => {
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
  async ({ postId }, { rejectWithValue }) => {
    try {
      const response = await postService.unlikePost(postId);
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
      return { ...response, query, page };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to update post in arrays
const updatePostInArrays = (state, postId, updates) => {
  const updatePostInArray = (posts) => {
    const index = posts.findIndex(post => post.id === postId);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updates };
    }
  };

  updatePostInArray(state.feed);
  updatePostInArray(state.trending);
  updatePostInArray(state.userPosts);
  updatePostInArray(state.searchResults);
  
  if (state.currentPost?.id === postId) {
    state.currentPost = { ...state.currentPost, ...updates };
  }
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    updatePostLike: (state, action) => {
      const { postId, liked, likes_count } = action.payload;
      updatePostInArrays(state, postId, {
        is_liked: liked,
        likes_count: likes_count
      });
    },
    updatePostCommentCount: (state, action) => {
      const { postId, comments_count } = action.payload;
      updatePostInArrays(state, postId, {
        comments_count: comments_count
      });
    },
    markPostAsTrending: (state, action) => {
      const { postId, trending_score } = action.payload;
      updatePostInArrays(state, postId, {
        is_trending: true,
        trending_score: trending_score
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Feed
      .addCase(getFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeed.fulfilled, (state, action) => {
        state.loading = false;
        const { posts, hasNext, page, refresh } = action.payload;
        
        if (refresh || page === 1) {
          state.feed = posts;
        } else {
          state.feed = [...state.feed, ...posts];
        }
        
        state.feedPagination = {
          page: page,
          hasNext: hasNext,
          loading: false
        };
      })
      .addCase(getFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Trending Posts
      .addCase(getTrendingPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTrendingPosts.fulfilled, (state, action) => {
        state.loading = false;
        const { posts, hasNext, page, refresh } = action.payload;
        
        if (refresh || page === 1) {
          state.trending = posts;
        } else {
          state.trending = [...state.trending, ...posts];
        }
        
        state.trendingPagination = {
          page: page,
          hasNext: hasNext,
          loading: false
        };
      })
      .addCase(getTrendingPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        const newPost = action.payload.post;
        // Add new post to the beginning of feed
        state.feed.unshift(newPost);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Like Post
      .addCase(likePost.pending, (state) => {
        // Optimistic update - immediately update UI
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, likes_count } = action.payload;
        updatePostInArrays(state, postId, {
          is_liked: true,
          likes_count: likes_count
        });
      })
      .addCase(likePost.rejected, (state, action) => {
        // Revert optimistic update on error
        state.error = action.payload;
      })

      // Unlike Post
      .addCase(unlikePost.pending, (state) => {
        // Optimistic update - immediately update UI
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        const { postId, likes_count } = action.payload;
        updatePostInArrays(state, postId, {
          is_liked: false,
          likes_count: likes_count
        });
      })
      .addCase(unlikePost.rejected, (state, action) => {
        // Revert optimistic update on error
        state.error = action.payload;
      })

      // Search Posts
      .addCase(searchPosts.pending, (state) => {
        state.searching = true;
        state.error = null;
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.searching = false;
        const { posts, page } = action.payload;
        
        if (page === 1) {
          state.searchResults = posts;
        } else {
          state.searchResults = [...state.searchResults, ...posts];
        }
      })
      .addCase(searchPosts.rejected, (state, action) => {
        state.searching = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearSearchResults, 
  updatePostLike, 
  updatePostCommentCount,
  markPostAsTrending
} = postSlice.actions;

export default postSlice.reducer;

// Selectors
export const selectFeed = (state) => state.posts.feed;
export const selectTrending = (state) => state.posts.trending;
export const selectLoading = (state) => state.posts.loading;
export const selectError = (state) => state.posts.error;
export const selectFeedPagination = (state) => state.posts.feedPagination;
export const selectTrendingPagination = (state) => state.posts.trendingPagination;
export const selectSearchResults = (state) => state.posts.searchResults;
export const selectSearching = (state) => state.posts.searching;