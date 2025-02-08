import { useAuth } from '../context/AuthContext';
import LandingPage from '../pages/Home/LandingPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session } = useAuth();

  if (!session) {
    return <LandingPage />;
  }

  return <>{children}</>;
};
