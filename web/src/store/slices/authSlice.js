// web/src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// FIXED: Remove destructuring since authService is default export
import authService from '../../services/authService';

// ====================
// ASYNC THUNKS
// ====================

// Login user
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('🔐 Redux: Attempting login...', credentials.email);
      
      const result = await authService.login(credentials);
      
      if (result.success) {
        console.log('✅ Redux: Login successful');
        
        // Immediately fetch user data after successful login
        const userResult = await authService.getCurrentUser();
        
        if (userResult.success) {
          console.log('✅ Redux: User data fetched successfully');
          return {
            token: result.data.access_token,
            user: userResult.data
          };
        } else {
          console.warn('⚠️ Redux: Login successful but failed to fetch user data');
          return {
            token: result.data.access_token,
            user: null
          };
        }
      } else {
        console.error('❌ Redux: Login failed:', result.error);
        return rejectWithValue(result.error);
      }
    } catch (error) {
      console.error('❌ Redux: Login exception:', error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Register user
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('🔐 Redux: Attempting registration...', userData.email);
      
      const result = await authService.register(userData);
      
      if (result.success) {
        console.log('✅ Redux: Registration successful');
        return result.data;
      } else {
        console.error('❌ Redux: Registration failed:', result.error);
        return rejectWithValue(result.error);
      }
    } catch (error) {
      console.error('❌ Redux: Registration exception:', error);
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔐 Redux: Fetching current user...');
      
      const result = await authService.getCurrentUser();
      
      if (result.success) {
        console.log('✅ Redux: Current user fetched successfully');
        return result.data;
      } else {
        console.error('❌ Redux: Failed to fetch current user:', result.error);
        return rejectWithValue(result.error);
      }
    } catch (error) {
      console.error('❌ Redux: Get current user exception:', error);
      return rejectWithValue(error.message || 'Failed to fetch user');
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔐 Redux: Attempting logout...');
      
      const result = await authService.logout();
      
      if (result.success) {
        console.log('✅ Redux: Logout successful');
        return true;
      } else {
        console.warn('⚠️ Redux: Logout had issues but proceeding');
        return true; // Still proceed with logout
      }
    } catch (error) {
      console.error('❌ Redux: Logout exception:', error);
      // Still proceed with logout even if there's an error
      authService.clearStoredData();
      return true;
    }
  }
);

// ====================
// INITIAL STATE
// ====================

const initialState = {
  user: null,
  token: authService.getToken(),
  isAuthenticated: !!authService.getToken(),
  loading: false,
  error: null,
  registrationSuccess: false
};

// ====================
// AUTH SLICE
// ====================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear auth error
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear registration success
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Reset auth state
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.registrationSuccess = false;
    },
    
    // Update user data
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        console.log('🔐 Redux: Auth state updated after login');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        console.error('🔐 Redux: Auth state updated after login failure');
      });

    // Registration cases
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.registrationSuccess = true;
        console.log('🔐 Redux: Registration successful');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
        state.registrationSuccess = false;
        console.error('🔐 Redux: Registration failed');
      });

    // Get current user cases
    builder
      .addCase(getCurrentUser.pending, (state) => {
        // Don't set loading for getCurrentUser to avoid UI flicker
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        console.log('🔐 Redux: Current user updated');
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch user';
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        console.error('🔐 Redux: Current user fetch failed');
      });

    // Logout cases
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.registrationSuccess = false;
        console.log('🔐 Redux: Logout completed');
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails, clear the state
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.registrationSuccess = false;
        console.log('🔐 Redux: Logout completed (with errors)');
      });
  }
});

// ====================
// EXPORT ACTIONS & REDUCER
// ====================

export const {
  clearError,
  clearRegistrationSuccess,
  setLoading,
  resetAuth,
  updateUser
} = authSlice.actions;

export default authSlice.reducer;

// ====================
// SELECTORS
// ====================

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;