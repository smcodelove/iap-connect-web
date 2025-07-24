// store/slices/commentSlice.js - Comments Redux State Management
/**
 * Comment Redux slice for managing comments state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postService from '../../services/postService';

// Initial state
const initialState = {
  comments: [],
  loading: false,
  error: null,
  currentPostId: null,
};

// Async thunks
export const getPostComments = createAsyncThunk(
  'comments/getPostComments',
  async ({ postId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await postService.getPostComments(postId, page);
      return { ...response, postId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await postService.addComment(postId, content);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = [];
      state.currentPostId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Post Comments
      .addCase(getPostComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPostComments.fulfilled, (state, action) => {
        state.loading = false;
        const { comments, postId } = action.payload;
        state.comments = comments;
        state.currentPostId = postId;
      })
      .addCase(getPostComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Comment
      .addCase(addComment.pending, (state) => {
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const newComment = action.payload.comment;
        state.comments.push(newComment);
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearComments, clearError } = commentSlice.actions;

export default commentSlice.reducer;

// Selectors
export const selectComments = (state) => state.comments.comments;
export const selectCommentsLoading = (state) => state.comments.loading;
export const selectCommentsError = (state) => state.comments.error;