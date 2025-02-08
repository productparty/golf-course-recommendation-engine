import React from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log detailed error information
    console.error('Application Error Details:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo,
      environment: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        // Log environment variable availability (not values)
        env: {
          VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
          VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          VITE_APP_URL: !!import.meta.env.VITE_APP_URL,
          VITE_API_URL: !!import.meta.env.VITE_API_URL
        }
      }
    });
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      return this.props.fallback || (
        <Box p={4} sx={{ maxWidth: 800, margin: '0 auto' }}>
          <Typography variant="h4" color="error" gutterBottom>
            Application Error
          </Typography>
          <Typography variant="body1" paragraph>
            An unexpected error has occurred. Please try refreshing the page or contact support if the problem persists.
          </Typography>
          {error && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: 'grey.100', 
              borderRadius: 1,
              whiteSpace: 'pre-wrap',
              overflow: 'auto'
            }}>
              <Typography variant="body2" color="error">
                Error: {error.message}
              </Typography>
              {process.env.NODE_ENV === 'development' && error.stack && (
                <Typography variant="caption" component="pre" sx={{ mt: 1 }}>
                  {error.stack}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      );
    }
    return this.props.children;
  }
}
