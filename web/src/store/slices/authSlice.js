// src/store/slices/authSlice.js - UPDATED WITH YOUR EXISTING CODE
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/api';

// FIXED: Import constants properly
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_DATA: 'user_data'
};

const ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me'
};

// Async thunks - UPDATED: Use proper API service
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Attempting login with:', credentials);
      const response = await authService.login(credentials);
      
      if (response.success) {
        // Get user data
        const userResponse = await authService.getCurrentUser();
        
        if (userResponse.success) {
          const userData = userResponse.data;
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
          
          return { 
            access_token: response.data.access_token, 
            user: userData 
          };
        } else {
          throw new Error('Failed to get user data');
        }
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Attempting registration with:', userData);
      const response = await authService.register(userData);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Get current user error:', error);
      return rejectWithValue(error.message || 'Failed to get user data');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      authService.logout(); // This clears localStorage and redirects
      return true;
    } catch (error) {
      // Even if logout fails, clear local storage
      authService.logout();
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Initial state - UPDATED: Better initialization
const getInitialUser = () => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

const initialState = {
  user: getInitialUser(),
  token: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  loading: false,
  error: null,
  registrationSuccess: false
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
    
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(action.payload));
    },
    
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.registrationSuccess = false;
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem('token'); // Remove backup token
    },
    
    // FIXED: Add this action for compatibility
    resetAuth: (state) => {
      authSlice.caseReducers.clearAuth(state);
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
        console.log('Login successful, user set:', action.payload.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
        // Clear any stored data on login failure
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem('token');
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.registrationSuccess = true;
        // Don't automatically log in after registration
        console.log('Registration successful:', action.payload);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registrationSuccess = false;
      })
      
      // Get current user cases
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(action.payload));
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
        localStorage.removeItem('token');
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
        state.registrationSuccess = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        // Even if logout fails, clear the auth state
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
        state.registrationSuccess = false;
      });
  }
});

export const { 
  clearError, 
  clearRegistrationSuccess, 
  setUser, 
  clearAuth, 
  resetAuth 
} = authSlice.actions;

export default authSlice.reducer;