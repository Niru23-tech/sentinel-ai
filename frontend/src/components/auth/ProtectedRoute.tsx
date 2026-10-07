// SentinelX AI - Route Protection Guard Component

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-cyber-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-gray-400 uppercase tracking-widest">
            Verifying SentinelX Session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
