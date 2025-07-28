// web/src/App.js - FIXED WITH CORRECT IMPORTS
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import store from './store';
import { colors, typography } from './utils/constants';
import GlobalStyles from './styles/GlobalStyles';

// Import Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/home/HomePage';
import FeedPage from './pages/feed/FeedPage';
import TrendingPage from './pages/trending/TrendingPage';
import ProfilePage from './pages/profile/ProfilePage';
import EditProfilePage from './pages/profile/EditProfilePage';
import CreatePostPage from './pages/post/CreatePostPage';
import PostDetailPage from './pages/post/PostDetailPage';
import SearchPage from './pages/search/SearchPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import BookmarksPage from './pages/bookmarks/BookmarksPage';

// Import User Pages (NEW)
import UserProfilePage from './pages/user/UserProfilePage';
import UserFollowersPage from './pages/user/UserFollowersPage';
import UserFollowingPage from './pages/user/UserFollowingPage';
import UserPostsPage from './pages/user/UserPostsPage';
import ConnectionsPage from './pages/user/ConnectionsPage';

// Import Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Theme configuration
const theme = {
  colors,
  typography,
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    large: '1200px'
  }
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route 
                path="/*" 
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

// Layout component for authenticated pages
const AppLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/trending" element={<TrendingPage />} />
            <Route path="/home" element={<HomePage />} />
            
            {/* Profile Routes */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            
            {/* User Profile Routes */}
            <Route path="/user/:id" element={<UserProfilePage />} />
            <Route path="/user/:id/posts" element={<UserPostsPage />} />
            <Route path="/user/:id/followers" element={<UserFollowersPage />} />
            <Route path="/user/:id/following" element={<UserFollowingPage />} />
            
            {/* Post Routes */}
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route path="/post/:id" element={<PostDetailPage />} />
            
            {/* Other Routes */}
            <Route path="/search" element={<SearchPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            
            {/* Placeholder Routes */}
            <Route path="/notifications" element={<div>Notifications page coming soon!</div>} />
            
            {/* 404 Route */}
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;