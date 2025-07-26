// web/src/store/slices/postSlice.js
/**
 * Enhanced Post Redux Slice with complete social features
 * Features: Posts, comments, likes, follows, bookmarks
 * FIXED: Import/export syntax errors resolved
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postService, commentService } from '../../services/api';

// Async thunks for API calls

// Fetch feed posts
export const fetchFeedPosts = createAsyncThunk(
  'posts/fetchFeed',
  async ({ page = 1, size = 20 }, { rejectWithValue }) => {
    try {
      const response = await postService.getFeed(page, size);
      return {
        posts: response.posts,
        total: response.total,
        hasNext: response.hasNext,
        page
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch trending posts
export const fetchTrendingPosts = createAsyncThunk(
  'posts/fetchTrending',
  async ({ page = 1, size = 20, hoursWindow = 72 }, { rejectWithValue }) => {
    try {
      const response = await postService.getTrendingPosts(page, size, hoursWindow);
      return {
        posts: response.posts,
        total: response.total,
        hasNext: response.hasNext,
        page
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create new post
export const createPost = createAsyncThunk(
  'posts/create',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await postService.createPost(postData);
      return response.post;
    } catch (error) {
      return rejectWithValue(error.message);
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
        likesCount: response.likes_count
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Bookmark/unbookmark post
export const togglePostBookmark = createAsyncThunk(
  'posts/toggleBookmark',
  async ({ postId, currentlyBookmarked }, { rejectWithValue }) => {
    try {
      const response = currentlyBookmarked 
        ? await postService.unbookmarkPost(postId)
        : await postService.bookmarkPost(postId);
      
      return {
        postId,
        bookmarked: response.bookmarked
      };
    } catch (error) {
      return rejectWithValue(error.message);
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
        comments: response.comments,
        total: response.total,
        page
      };
    } catch (error) {
      return rejectWithValue(error.message);
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
      return rejectWithValue(error.message);
    }
  }
);

// Like/unlike comment
export const toggleCommentLike = createAsyncThunk(
  'posts/toggleCommentLike',
  async ({ commentId, currentlyLiked }, { rejectWithValue }) => {
    try {
      const response = currentlyLiked 
        ? await commentService.unlikeComment(commentId)
        : await commentService.likeComment(commentId);
      
      return {
        commentId,
        liked: response.liked,
        likesCount: response.likes_count
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete comment
export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async ({ commentId, postId }, { rejectWithValue }) => {
    try {
      await commentService.deleteComment(commentId);
      return { commentId, postId };
    } catch (error) {
      return rejectWithValue(error.message);
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
        posts: response.posts,
        total: response.total,
        hasNext: response.hasNext,
        query,
        page
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
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
  
  // Stats
  totalPosts: 0,
  userPostsCount: 0
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
      
      // Update current post
      if (state.currentPost?.id === postId) {
        state.currentPost = { ...state.currentPost, ...updates };
      }
    },
    
    // Remove post from all arrays
    removePostFromAllArrays: (state, action) => {
      const postId = action.payload;
      
      state.feedPosts = state.feedPosts.filter(post => post.id !== postId);
      state.trendingPosts = state.trendingPosts.filter(post => post.id !== postId);
      state.searchPosts = state.searchPosts.filter(post => post.id !== postId);
      
      if (state.currentPost?.id === postId) {
        state.currentPost = null;
      }
      
      // Remove comments for this post
      delete state.comments[postId];
    },
    
    // Set current post
    setCurrentPost: (state, action) => {
      state.currentPost = action.payload;
    },
    
    // Update comment in comments array
    updateCommentInArray: (state, action) => {
      const { postId, commentId, updates } = action.payload;
      
      if (state.comments[postId]) {
        const commentIndex = state.comments[postId].comments.findIndex(
          comment => comment.id === commentId
        );
        
        if (commentIndex !== -1) {
          state.comments[postId].comments[commentIndex] = {
            ...state.comments[postId].comments[commentIndex],
            ...updates
          };
        }
        
        // Also check replies
        state.comments[postId].comments.forEach(comment => {
          if (comment.replies) {
            const replyIndex = comment.replies.findIndex(reply => reply.id === commentId);
            if (replyIndex !== -1) {
              comment.replies[replyIndex] = {
                ...comment.replies[replyIndex],
                ...updates
              };
            }
          }
        });
      }
    }
  },
  
  extraReducers: (builder) => {
    // Fetch feed posts
    builder
      .addCase(fetchFeedPosts.pending, (state) => {
        state.feedLoading = true;
        state.feedError = null;
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.feedLoading = false;
        const { posts, total, hasNext, page } = action.payload;
        
        if (page === 1) {
          state.feedPosts = posts;
        } else {
          // Append new posts, avoiding duplicates
          const existingIds = new Set(state.feedPosts.map(post => post.id));
          const newPosts = posts.filter(post => !existingIds.has(post.id));
          state.feedPosts.push(...newPosts);
        }
        
        state.feedHasNext = hasNext;
        state.feedPage = page;
        state.totalPosts = total;
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.feedLoading = false;
        state.feedError = action.payload;
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
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createPostLoading = false;
        // Add new post to the beginning of feed
        state.feedPosts.unshift(action.payload);
        state.userPostsCount += 1;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.createPostLoading = false;
        state.createPostError = action.payload;
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

    // Toggle post bookmark
    builder
      .addCase(togglePostBookmark.fulfilled, (state, action) => {
        const { postId, bookmarked } = action.payload;
        
        postSlice.caseReducers.updatePostInAllArrays(state, {
          payload: {
            postId,
            updates: {
              is_bookmarked: bookmarked
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
        const { postId, comments, total, page } = action.payload;
        
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
        
        // Update post comments count
        postSlice.caseReducers.updatePostInAllArrays(state, {
          payload: {
            postId,
            updates: {
              comments_count: (state.comments[postId].total || 0)
            }
          }
        });
      });

    // Toggle comment like
    builder
      .addCase(toggleCommentLike.fulfilled, (state, action) => {
        const { commentId, liked, likesCount } = action.payload;
        
        // Find and update comment in all posts
        Object.keys(state.comments).forEach(postId => {
          postSlice.caseReducers.updateCommentInArray(state, {
            payload: {
              postId,
              commentId,
              updates: {
                is_liked: liked,
                likes_count: likesCount
              }
            }
          });
        });
      });

    // Delete comment
    builder
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { commentId, postId } = action.payload;
        
        if (state.comments[postId]) {
          // Remove from top-level comments
          const commentIndex = state.comments[postId].comments.findIndex(
            comment => comment.id === commentId
          );
          
          if (commentIndex !== -1) {
            state.comments[postId].comments.splice(commentIndex, 1);
            state.comments[postId].total -= 1;
          } else {
            // Remove from replies
            state.comments[postId].comments.forEach(comment => {
              if (comment.replies) {
                const replyIndex = comment.replies.findIndex(
                  reply => reply.id === commentId
                );
                if (replyIndex !== -1) {
                  comment.replies.splice(replyIndex, 1);
                  comment.replies_count -= 1;
                }
              }
            });
          }
          
          // Update post comments count
          postSlice.caseReducers.updatePostInAllArrays(state, {
            payload: {
              postId,
              updates: {
                comments_count: state.comments[postId].total
              }
            }
          });
        }
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
  removePostFromAllArrays,
  setCurrentPost,
  updateCommentInArray
} = postSlice.actions;

// Selectors
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