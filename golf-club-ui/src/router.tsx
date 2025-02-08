import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
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
