// web/src/store/slices/postSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { ENDPOINTS } from '../../utils/constants';

// Async thunks
export const fetchFeedPosts = createAsyncThunk(
  'posts/fetchFeedPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.POSTS_FEED);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch feed posts'
      );
    }
  }
);

export const fetchTrendingPosts = createAsyncThunk(
  'posts/fetchTrendingPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.POSTS_TRENDING);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch trending posts'
      );
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await api.post(ENDPOINTS.POSTS, postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to create post'
      );
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.post(`${ENDPOINTS.POSTS}/${postId}/like`);
      return { postId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to like post'
      );
    }
  }
);

export const unlikePost = createAsyncThunk(
  'posts/unlikePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`${ENDPOINTS.POSTS}/${postId}/like`);
      return { postId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to unlike post'
      );
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`${ENDPOINTS.POSTS}/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch post'
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await api.delete(`${ENDPOINTS.POSTS}/${postId}`);
      return postId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to delete post'
      );
    }
  }
);

export const searchPosts = createAsyncThunk(
  'posts/searchPosts',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`${ENDPOINTS.POSTS}/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to search posts'
      );
    }
  }
);

// Initial state
const initialState = {
  posts: [],
  currentPost: null,
  searchResults: [],
  loading: false,
  error: null,
  stats: {
    total_posts: 0,
    active_users: 0,
    discussions: 0
  },
  hasNextPage: true,
  page: 1
};

// Posts slice
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
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    updatePostInFeed: (state, action) => {
      const { postId, updates } = action.payload;
      const index = state.posts.findIndex(post => post.id === postId);
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch feed posts
      .addCase(fetchFeedPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts || action.payload;
        state.stats = action.payload.stats || state.stats;
        state.error = null;
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch trending posts
      .addCase(fetchTrendingPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrendingPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts || action.payload;
        state.error = null;
      })
      .addCase(fetchTrendingPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId } = action.payload;
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          post.is_liked_by_user = true;
          post.likes_count = (post.likes_count || 0) + 1;
        }
        if (state.currentPost && state.currentPost.id === postId) {
          state.currentPost.is_liked_by_user = true;
          state.currentPost.likes_count = (state.currentPost.likes_count || 0) + 1;
        }
      })

      // Unlike post
      .addCase(unlikePost.fulfilled, (state, action) => {
        const { postId } = action.payload;
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          post.is_liked_by_user = false;
          post.likes_count = Math.max((post.likes_count || 1) - 1, 0);
        }
        if (state.currentPost && state.currentPost.id === postId) {
          state.currentPost.is_liked_by_user = false;
          state.currentPost.likes_count = Math.max((state.currentPost.likes_count || 1) - 1, 0);
        }
      })

      // Fetch post by ID
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
        state.error = null;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.payload;
        state.posts = state.posts.filter(post => post.id !== postId);
        if (state.currentPost && state.currentPost.id === postId) {
          state.currentPost = null;
        }
      })

      // Search posts
      .addCase(searchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
        state.error = null;
      })
      .addCase(searchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentPost, clearSearchResults, updatePostInFeed } = postSlice.actions;
export default postSlice.reducer;