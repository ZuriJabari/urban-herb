import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state: { user, isLoading } } = useAuth();
  const location = useLocation();

  // Debug logging
  useEffect(() => {
    console.log('ProtectedRoute - State:', {
      isLoading,
      hasUser: !!user,
      userEmail: user?.email,
      pathname: location.pathname,
      hasToken: !!localStorage.getItem('token'),
      hasRefreshToken: !!localStorage.getItem('refresh_token')
    });
  }, [user, isLoading, location]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Redirect to login but save the attempted URL
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute - User authenticated, rendering children');
  return <>{children}</>;
};
