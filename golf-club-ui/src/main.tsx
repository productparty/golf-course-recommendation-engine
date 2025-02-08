import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import './styles/tailwind.css';
import './index.css';
import './App.css';

const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  </React.StrictMode>,
);
