import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import LoginPage from './pages/login/Login';
import HomePage from './pages/Home/home';
import Dashboard from './pages/Home/Dashboard';
import FindClubUpdated from './pages/FindClub/FindClubUpdated';
import RecommendClubUpdated from './pages/RecommendClub/RecommendClubUpdated';
import Favorites from './pages/Favorites/Favorites';
import CreateAccountPage from './pages/CreateAccount/CreateAccountPage';
import PasswordResetPage from './pages/PasswordReset/PasswordResetPage';
import PasswordResetConfirm from './pages/PasswordReset/PasswordResetConfirm';
import ClubDetail from './pages/ClubDetail/ClubDetail';
import NotFound from './pages/NotFound/NotFound';

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
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
        errorElement: <NotFound />,
      },
      {
        path: '/dashboard',
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
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/create-account',
        element: <CreateAccountPage />,
      },
      {
        path: '/password-reset',
        element: <PasswordResetPage />,
      },
      {
        path: '/password-reset-confirm',
        element: <PasswordResetConfirm />,
      },
      {
        path: '/clubs/:id',
        element: (
          <ProtectedRoute>
            <ClubDetail />
          </ProtectedRoute>
        ),
      },
    ],
    errorElement: <NotFound />,
  },
  {
    path: '*',
    element: <NotFound />,
  }
]);

export default router;
