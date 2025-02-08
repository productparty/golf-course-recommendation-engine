import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

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

const Home = lazy(() => import('./pages/Home/home'));
const Dashboard = lazy(() => import('./pages/Home/Dashboard'));
const FindClubUpdated = lazy(() => import('./pages/FindClub/FindClubUpdated'));
const RecommendClubUpdated = lazy(() => import('./pages/RecommendClub/RecommendClubUpdated'));
const Favorites = lazy(() => import('./pages/Favorites/Favorites'));
const GolferProfileUpdated = lazy(() => import('./pages/GolferProfile/GolferProfileUpdated'));
const Login = lazy(() => import('./pages/login/Login'));
const CreateAccount = lazy(() => import('./pages/CreateAccount/CreateAccount'));
const PasswordResetRequest = lazy(() => import('./pages/PasswordResetRequest/PasswordResetRequest'));
const PasswordResetConfirm = lazy(() => import('./pages/PasswordResetConfirm/PasswordResetConfirm'));
const ClubDetail = lazy(() => import('./pages/ClubDetail/ClubDetail'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const LandingPage = lazy(() => import('./pages/Home/LandingPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: withSuspense(NotFound),
    children: [
      {
        path: '/',
        element: withSuspense(LandingPage)
      },
      {
        path: '/dashboard',
        element: <ProtectedRoute>{withSuspense(Dashboard)}</ProtectedRoute>
      },
      {
        path: '/find',
        element: <ProtectedRoute>{withSuspense(FindClubUpdated)}</ProtectedRoute>
      },
      {
        path: '/recommend',
        element: <ProtectedRoute>{withSuspense(RecommendClubUpdated)}</ProtectedRoute>
      },
      {
        path: '/favorites',
        element: <ProtectedRoute>{withSuspense(Favorites)}</ProtectedRoute>
      },
      {
        path: '/profile',
        element: <ProtectedRoute>{withSuspense(GolferProfileUpdated)}</ProtectedRoute>
      },
      {
        path: '/login',
        element: withSuspense(Login)
      },
      {
        path: '/create-account',
        element: withSuspense(CreateAccount)
      },
      {
        path: '/password-reset',
        element: withSuspense(PasswordResetRequest)
      },
      {
        path: '/password-reset-confirm',
        element: withSuspense(PasswordResetConfirm)
      },
      {
        path: '/clubs/:id',
        element: <ProtectedRoute>{withSuspense(ClubDetail)}</ProtectedRoute>
      }
    ]
  }
]);
