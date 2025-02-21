import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import React, { lazy, Suspense } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { AuthProvider } from './context/AuthContext';
const Login = lazy(() => import('./pages/login/Login'));
const HomePage = lazy(() => import('./pages/Home/HomePage'));
const Dashboard = lazy(() => import('./pages/Home/Dashboard'));
const FindClubUpdated = lazy(() => import('./pages/FindClub/FindClubUpdated'));
const RecommendClubUpdated = lazy(() => import('./pages/RecommendClub/RecommendClubUpdated'));
const Favorites = lazy(() => import('./pages/Favorites/Favorites'));
const CreateAccount = lazy(() => import('./pages/CreateAccount/CreateAccount'));
const PasswordResetRequest = lazy(() => import('./pages/PasswordResetRequest/PasswordResetRequest'));
const ClubDetail = lazy(() => import('./pages/ClubDetail/ClubDetail'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const PasswordResetPage = lazy(() => import('./pages/PasswordReset/PasswordResetPage'));
const PasswordResetConfirm = lazy(() => import('./pages/PasswordReset/PasswordResetConfirm'));
const LandingPage = lazy(() => import('./pages/Home/LandingPage'));
const GolferProfileUpdated = lazy(() => import('./pages/GolferProfile/GolferProfileUpdated'));

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

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    ),
    children: [
      {
        path: 'login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Login />
          </Suspense>
        )
      },
      {
        path: 'create-account',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CreateAccount />
          </Suspense>
        )
      },
      {
        path: 'password-reset-request',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PasswordResetRequest />
          </Suspense>
        )
      },
      {
        path: 'password-reset',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PasswordResetPage />
          </Suspense>
        )
      },
      {
        path: '/',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LandingPage />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/find-club',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <FindClubUpdated />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/recommend-club',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <RecommendClubUpdated />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/favorites',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <Favorites />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/clubs/:id',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ClubDetail />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <GolferProfileUpdated />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ]
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    ),
  }
]);

export default router;
