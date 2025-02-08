import React, { forwardRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box } from '@mui/material';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = forwardRef<HTMLDivElement, ProtectedRouteProps>(
  ({ children }, ref) => {
    const { session } = useAuth();

    if (!session || !session.access_token) {
      return <Navigate to="/" replace />;
    }

    return <Box ref={ref}>{children}</Box>;
  }
);

ProtectedRoute.displayName = 'ProtectedRoute';
