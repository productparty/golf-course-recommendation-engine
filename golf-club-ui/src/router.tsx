import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Login from './pages/login/Login';
import HomePage from './pages/Home/HomePage';
import Dashboard from './pages/Home/Dashboard';
import FindClubUpdated from './pages/FindClub/FindClubUpdated';
import RecommendClubUpdated from './pages/RecommendClub/RecommendClubUpdated';
import Favorites from './pages/Favorites/Favorites';
import CreateAccount from './pages/CreateAccount/CreateAccount';
import PasswordResetRequest from './pages/PasswordResetRequest/PasswordResetRequest';
import ClubDetail from './pages/ClubDetail/ClubDetail';
import NotFound from './pages/NotFound/NotFound';
import { AuthProvider } from './context/AuthContext';
import PasswordResetPage from './pages/PasswordReset/PasswordResetPage';
import PasswordResetConfirm from './pages/PasswordReset/PasswordResetConfirm';
import LandingPage from './pages/Home/LandingPage';
import GolferProfileUpdated from './pages/GolferProfile/GolferProfileUpdated';

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
    errorElement: <NotFound />,
    children: [
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'create-account',
        element: <CreateAccount />
      },
      {
        path: 'password-reset-request',
        element: <PasswordResetRequest />
      },
      {
        path: 'password-reset',
        element: <PasswordResetPage />
      },
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/find-club',
        element: (
          <ProtectedRoute>
            <FindClubUpdated />
          </ProtectedRoute>
        ),
      },
      {
        path: '/recommend-club',
        element: (
          <ProtectedRoute>
            <RecommendClubUpdated />
          </ProtectedRoute>
        ),
      },
      {
        path: '/favorites',
        element: (
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        ),
      },
      {
        path: '/clubs/:id',
        element: (
          <ProtectedRoute>
            <ClubDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <GolferProfileUpdated />
          </ProtectedRoute>
        ),
      },
    ]
  },
  {
    path: '*',
    element: <NotFound />,
  }
]);

export default router;
