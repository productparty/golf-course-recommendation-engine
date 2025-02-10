import { createBrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Login from './pages/login/Login';
import Home from './pages/Home/home';
import Dashboard from './pages/Home/Dashboard';
import FindClubUpdated from './pages/FindClub/FindClubUpdated';
import RecommendClubUpdated from './pages/RecommendClub/RecommendClubUpdated';
import Favorites from './pages/Favorites/Favorites';
import GolferProfileUpdated from './pages/GolferProfile/GolferProfileUpdated';
import CreateAccount from './pages/CreateAccount/CreateAccount';
import PasswordResetRequest from './pages/PasswordResetRequest/PasswordResetRequest';
import PasswordResetConfirm from './pages/PasswordResetConfirm/PasswordResetConfirm';
import ClubDetail from './pages/ClubDetail/ClubDetail';
import NotFound from './pages/NotFound/NotFound';
import LandingPage from './pages/Home/LandingPage';

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

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: withSuspense(NotFound),
    children: [
      {
        path: '/',
        element: <LandingPage />
      },
      {
        path: '/dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>
      },
      {
        path: '/find',
        element: <ProtectedRoute><FindClubUpdated /></ProtectedRoute>
      },
      {
        path: '/recommend',
        element: <ProtectedRoute><RecommendClubUpdated /></ProtectedRoute>
      },
      {
        path: '/favorites',
        element: <ProtectedRoute><Favorites /></ProtectedRoute>
      },
      {
        path: '/profile',
        element: <ProtectedRoute><GolferProfileUpdated /></ProtectedRoute>
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/create-account',
        element: <CreateAccount />
      },
      {
        path: '/password-reset',
        element: <PasswordResetRequest />
      },
      {
        path: '/password-reset-confirm',
        element: <PasswordResetConfirm />
      },
      {
        path: '/clubs/:id',
        element: <ProtectedRoute><ClubDetail /></ProtectedRoute>
      }
    ]
  }
]);
