// src/store/slices/postSlice.js - UPDATED WITH YOUR EXISTING CODE
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postService, commentService } from '../../services/api';

// Async thunks for API calls - FIXED: Use correct service methods

// Fetch feed posts - FIXED: Proper API integration
export const fetchFeedPosts = createAsyncThunk(
  'posts/fetchFeed',
  async ({ page = 1, size = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await postService.getFeed(page, size);
      return {
        posts: response.posts || [],
        total: response.total || 0,
        hasNext: response.hasNext || false,
        page,
        pagination: response.pagination || { page, has_more: false }
      };
    } catch (error) {
      console.error('Fetch feed error:', error);
      return rejectWithValue(error.message || 'Failed to fetch feed');
    }
  }
);

// Fetch trending posts
export const fetchTrendingPosts = createAsyncThunk(
  'posts/fetchTrending',
  async ({ page = 1, size = 20, hoursWindow = 72 } = {}, { rejectWithValue }) => {
    try {
      const response = await postService.getTrendingPosts(page, size, hoursWindow);
      return {
        posts: response.posts || [],
        total: response.total || 0,
        hasNext: response.hasNext || false,
        page,
        pagination: response.pagination || { page, has_more: false }
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch trending posts');
    }
  }
);

// Create new post - FIXED: Proper data handling
export const createPost = createAsyncThunk(
  'posts/create',
  async (postData, { rejectWithValue }) => {
    try {
      console.log('Creating post with data:', postData);
      const response = await postService.createPost(postData);
      console.log('Post created successfully:', response);
      return response.post;
    } catch (error) {
      console.error('Create post error:', error);
      return rejectWithValue(error.message || 'Failed to create post');
    }
  }
);

// Like/unlike post
export const togglePostLike = createAsyncThunk(
  'posts/toggleLike',
  async ({ postId, currentlyLiked }, { rejectWithValue }) => {
    try {
      const response = currentlyLiked 
        ? await postService.unlikePost(postId)
        : await postService.likePost(postId);
      
      return {
        postId,
        liked: response.liked,
        likesCount: response.likes_count || 0
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to toggle like');
    }
  }
);

// Search posts
export const searchPosts = createAsyncThunk(
  'posts/search',
  async ({ query, page = 1, size = 20 }, { rejectWithValue }) => {
    try {
      const response = await postService.searchPosts(query, page, size);
      return {
        posts: response.posts || [],
        total: response.total || 0,
        hasNext: response.hasNext || false,
        query,
        page
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to search posts');
    }
  }
);

// Fetch post comments
export const fetchPostComments = createAsyncThunk(
  'posts/fetchComments',
  async ({ postId, page = 1, size = 50 }, { rejectWithValue }) => {
    try {
      const response = await commentService.getPostComments(postId, page, size);
      return {
        postId,
        comments: response.comments || [],
        total: response.total || 0,
        page
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch comments');
    }
  }
);

// Add comment to post
export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, content, parentId = null }, { rejectWithValue }) => {
    try {
      const response = await commentService.addComment(postId, content, parentId);
      return {
        postId,
        comment: response.comment,
        parentId
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add comment');
    }
  }
);

// Initial state - UPDATED: Better structure
const initialState = {
  // Feed posts
  feedPosts: [],
  feedLoading: false,
  feedError: null,
  feedHasNext: false,
  feedPage: 1,
  
  // Trending posts
  trendingPosts: [],
  trendingLoading: false,
  trendingError: null,
  trendingHasNext: false,
  trendingPage: 1,
  
  // Search results
  searchPosts: [],
  searchLoading: false,
  searchError: null,
  searchQuery: '',
  searchHasNext: false,
  searchPage: 1,
  
  // Current post (for detail view)
  currentPost: null,
  currentPostLoading: false,
  currentPostError: null,
  
  // Comments
  comments: {}, // { postId: { comments: [], total: 0, loading: false } }
  
  // UI state
  createPostLoading: false,
  createPostError: null,
  loading: false, // General loading state
  error: null,    // General error state
  
  // Stats
  totalPosts: 0,
  userPostsCount: 0,
  
  // For FeedPage compatibility
  posts: [], // This will mirror feedPosts for backward compatibility
  stats: {
    total_posts: 0,
    active_users: 0,
    discussions: 0
  }
};

// Create slice
const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.feedError = null;
      state.trendingError = null;
      state.searchError = null;
      state.currentPostError = null;
      state.createPostError = null;
      state.error = null;
    },
    
    // Reset search
    resetSearch: (state) => {
      state.searchPosts = [];
      state.searchQuery = '';
      state.searchPage = 1;
      state.searchHasNext = false;
      state.searchError = null;
    },
    
    // Update post in all relevant arrays
    updatePostInAllArrays: (state, action) => {
      const { postId, updates } = action.payload;
      
      // Update in feed posts
      const feedIndex = state.feedPosts.findIndex(post => post.id === postId);
      if (feedIndex !== -1) {
        state.feedPosts[feedIndex] = { ...state.feedPosts[feedIndex], ...updates };
      }
      
      // Update in trending posts
      const trendingIndex = state.trendingPosts.findIndex(post => post.id === postId);
      if (trendingIndex !== -1) {
        state.trendingPosts[trendingIndex] = { ...state.trendingPosts[trendingIndex], ...updates };
      }
      
      // Update in search posts
      const searchIndex = state.searchPosts.findIndex(post => post.id === postId);
      if (searchIndex !== -1) {
        state.searchPosts[searchIndex] = { ...state.searchPosts[searchIndex], ...updates };
      }
      
      // Update in posts array (for backward compatibility)
      const postsIndex = state.posts.findIndex(post => post.id === postId);
      if (postsIndex !== -1) {
        state.posts[postsIndex] = { ...state.posts[postsIndex], ...updates };
      }
      
      // Update current post
      if (state.currentPost?.id === postId) {
        state.currentPost = { ...state.currentPost, ...updates };
      }
    },
    
    // Set current post
    setCurrentPost: (state, action) => {
      state.currentPost = action.payload;
    }
  },
  
  extraReducers: (builder) => {
    // Fetch feed posts
    builder
      .addCase(fetchFeedPosts.pending, (state) => {
        state.feedLoading = true;
        state.feedError = null;
        state.loading = true; // For backward compatibility
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.feedLoading = false;
        state.loading = false;
        
        const { posts, total, hasNext, page, pagination } = action.payload;
        
        if (page === 1) {
          state.feedPosts = posts;
          state.posts = posts; // For backward compatibility
        } else {
          // Append new posts, avoiding duplicates
          const existingIds = new Set(state.feedPosts.map(post => post.id));
          const newPosts = posts.filter(post => !existingIds.has(post.id));
          state.feedPosts.push(...newPosts);
          state.posts = state.feedPosts; // Sync
        }
        
        state.feedHasNext = hasNext || pagination?.has_more || false;
        state.feedPage = page;
        state.totalPosts = total;
        
        // Update stats for backward compatibility
        state.stats.total_posts = total;
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.feedLoading = false;
        state.loading = false;
        state.feedError = action.payload;
        state.error = action.payload; // For backward compatibility
      });

    // Fetch trending posts
    builder
      .addCase(fetchTrendingPosts.pending, (state) => {
        state.trendingLoading = true;
        state.trendingError = null;
      })
      .addCase(fetchTrendingPosts.fulfilled, (state, action) => {
        state.trendingLoading = false;
        const { posts, total, hasNext, page } = action.payload;
        
        if (page === 1) {
          state.trendingPosts = posts;
        } else {
          const existingIds = new Set(state.trendingPosts.map(post => post.id));
          const newPosts = posts.filter(post => !existingIds.has(post.id));
          state.trendingPosts.push(...newPosts);
        }
        
        state.trendingHasNext = hasNext;
        state.trendingPage = page;
      })
      .addCase(fetchTrendingPosts.rejected, (state, action) => {
        state.trendingLoading = false;
        state.trendingError = action.payload;
      });

    // Create post
    builder
      .addCase(createPost.pending, (state) => {
        state.createPostLoading = true;
        state.createPostError = null;
        state.loading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createPostLoading = false;
        state.loading = false;
        
        // Add new post to the beginning of feed
        const newPost = action.payload;
        state.feedPosts.unshift(newPost);
        state.posts.unshift(newPost); // For backward compatibility
        state.userPostsCount += 1;
        state.totalPosts += 1;
        state.stats.total_posts += 1;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.createPostLoading = false;
        state.loading = false;
        state.createPostError = action.payload;
        state.error = action.payload;
      });

    // Toggle post like
    builder
      .addCase(togglePostLike.fulfilled, (state, action) => {
        const { postId, liked, likesCount } = action.payload;
        
        // Update post in all arrays
        postSlice.caseReducers.updatePostInAllArrays(state, {
          payload: {
            postId,
            updates: {
              is_liked: liked,
              likes_count: likesCount
            }
          }
        });
      });

    // Fetch comments
    builder
      .addCase(fetchPostComments.pending, (state, action) => {
        const postId = action.meta.arg.postId;
        
        if (!state.comments[postId]) {
          state.comments[postId] = {
            comments: [],
            total: 0,
            loading: false,
            error: null
          };
        }
        
        state.comments[postId].loading = true;
        state.comments[postId].error = null;
      })
      .addCase(fetchPostComments.fulfilled, (state, action) => {
        const { postId, comments, total } = action.payload;
        
        if (!state.comments[postId]) {
          state.comments[postId] = {
            comments: [],
            total: 0,
            loading: false,
            error: null
          };
        }
        
        state.comments[postId].loading = false;
        state.comments[postId].comments = comments;
        state.comments[postId].total = total;
      })
      .addCase(fetchPostComments.rejected, (state, action) => {
        const postId = action.meta.arg.postId;
        
        if (state.comments[postId]) {
          state.comments[postId].loading = false;
          state.comments[postId].error = action.payload;
        }
      });

    // Add comment
    builder
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment, parentId } = action.payload;
        
        // Initialize comments if not exists
        if (!state.comments[postId]) {
          state.comments[postId] = {
            comments: [],
            total: 0,
            loading: false,
            error: null
          };
        }
        
        if (parentId) {
          // Add as reply
          const parentComment = state.comments[postId].comments.find(
            c => c.id === parentId
          );
          if (parentComment) {
            if (!parentComment.replies) {
              parentComment.replies = [];
            }
            parentComment.replies.push(comment);
            parentComment.replies_count = (parentComment.replies_count || 0) + 1;
          }
        } else {
          // Add as top-level comment
          state.comments[postId].comments.unshift(comment);
          state.comments[postId].total += 1;
        }
        
        // Update post comments count in all arrays
        postSlice.caseReducers.updatePostInAllArrays(state, {
          payload: {
            postId,
            updates: {
              comments_count: (state.comments[postId].total || 0)
            }
          }
        });
      });

    // Search posts
    builder
      .addCase(searchPosts.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.searchLoading = false;
        const { posts, total, hasNext, query, page } = action.payload;
        
        state.searchQuery = query;
        
        if (page === 1) {
          state.searchPosts = posts;
        } else {
          const existingIds = new Set(state.searchPosts.map(post => post.id));
          const newPosts = posts.filter(post => !existingIds.has(post.id));
          state.searchPosts.push(...newPosts);
        }
        
        state.searchHasNext = hasNext;
        state.searchPage = page;
      })
      .addCase(searchPosts.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      });
  }
});

// Export actions
export const {
  clearErrors,
  resetSearch,
  updatePostInAllArrays,
  setCurrentPost
} = postSlice.actions;

// Selectors for compatibility
export const selectFeedPosts = (state) => state.posts.feedPosts;
export const selectTrendingPosts = (state) => state.posts.trendingPosts;
export const selectSearchPosts = (state) => state.posts.searchPosts;
export const selectCurrentPost = (state) => state.posts.currentPost;
export const selectPostComments = (postId) => (state) => state.posts.comments[postId];
export const selectFeedLoading = (state) => state.posts.feedLoading;
export const selectTrendingLoading = (state) => state.posts.trendingLoading;
export const selectSearchLoading = (state) => state.posts.searchLoading;
export const selectCreatePostLoading = (state) => state.posts.createPostLoading;

export default postSlice.reducer;