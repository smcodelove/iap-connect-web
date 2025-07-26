// web/src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { ENDPOINTS, STORAGE_KEYS } from '../../utils/constants';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post(ENDPOINTS.LOGIN, credentials);
      const { access_token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return { access_token, user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Login failed'
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post(ENDPOINTS.REGISTER, userData);
      const { access_token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return { access_token, user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Registration failed'
      );
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.ME);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to get user data'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post(ENDPOINTS.LOGOUT);
      
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      return true;
    } catch (error) {
      // Even if logout fails, clear local storage
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      return rejectWithValue(
        error.response?.data?.detail || 'Logout failed'
      );
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  loading: false,
  error: null
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
      })
      
      // Get current user cases
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // If getting user fails, likely token is invalid
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      })
      
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        // Even if logout fails, clear the auth state
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
      });
  }
});

export const { clearError, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;