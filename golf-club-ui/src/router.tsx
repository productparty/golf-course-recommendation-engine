import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home/home';
import Dashboard from './pages/Home/Dashboard';
import FindClubUpdated from './pages/FindClub/FindClubUpdated';
import RecommendClubUpdated from './pages/RecommendClub/RecommendClubUpdated';
import Favorites from './pages/Favorites/Favorites';
import GolferProfileUpdated from './pages/GolferProfile/GolferProfileUpdated';
import Login from './pages/Login/Login';
import CreateAccount from './pages/CreateAccount/CreateAccount';
import PasswordResetRequest from './pages/PasswordResetRequest/PasswordResetRequest';
import PasswordResetConfirm from './pages/PasswordResetConfirm/PasswordResetConfirm';
import ClubDetail from './pages/ClubDetail/ClubDetail';
import NotFound from './pages/NotFound/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';

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
        element: <FindClubUpdated />
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
        element: <ClubDetail />
      }
    ]
  }
]);
