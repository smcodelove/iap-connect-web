// web/src/components/auth/ProtectedRoute.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../../store/slices/authSlice';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token, loading } = useSelector(state => state.auth);

  useEffect(() => {
    // If we have a token but no user data, fetch user data
    if (token && !user && !loading) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, user, loading]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;