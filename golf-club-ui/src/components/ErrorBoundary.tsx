import React from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: any;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error: any, errorInfo: React.ErrorInfo) {
    // Log error details to console with more information
    console.error("Caught error in ErrorBoundary:", error);
    console.error("Component stack:", errorInfo.componentStack);
    
    // You could also log to an error tracking service here
    this.setState({ errorInfo: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Enhanced error display with more details in development
      return this.props.fallback || (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          p={4}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong.
          </Typography>
          <Typography variant="body1">
            {this.state.error?.message || "An unexpected error occurred."}
          </Typography>
          <Typography variant="body2">
            Please try refreshing the page or contact support.
          </Typography>
          {import.meta.env.DEV && this.state.errorInfo && (
            <Box mt={4} p={2} bgcolor="grey.100" borderRadius={1} width="100%" overflow="auto">
              <Box component="pre" sx={{ whiteSpace: 'pre-wrap', m: 0 }}>
                {this.state.errorInfo.componentStack}
              </Box>
            </Box>
          )}
        </Box>
      );
    }
    return this.props.children;
  }
}
