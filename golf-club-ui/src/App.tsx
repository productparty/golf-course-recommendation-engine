import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase'; // Update path if needed
import { Analytics } from "@vercel/analytics/react";
import { FavoritesProvider } from './context/FavoritesContext';

// Component imports
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home/home';
import FindClubUpdated from './pages/FindClub/FindClubUpdated';
import RecommendClubUpdated from './pages/RecommendClub/RecommendClubUpdated';
import SignUp from './pages/SignUp/signUp';
import SubmitClub from './pages/SubmitClub/submitClub';
import LogIn from './pages/LogIn/LogIn';
import GolferProfileUpdated from './pages/GolferProfile/GolferProfileUpdated';
import CreateAccount from './pages/CreateAccount/CreateAccount';
import CreateAccountSubmitted from './pages/CreateAccount/CreateAccountSubmitted';
import CreateAccountSuccessful from './pages/CreateAccount/CreateAccountSuccessful';
import PasswordResetRequest from './pages/PasswordResetRequest/PasswordResetRequest';
import PasswordResetConfirm from './pages/PasswordResetConfirm/PasswordResetConfirm';
import ErrorBoundary from './components/ErrorBoundary';
import theme from './theme';
import Favorites from './pages/Favorites/Favorites';

// Import styles
import './App.css';

const App: React.FC = () => {
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Handle successful sign in
      }
    });
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <FavoritesProvider>
            <BrowserRouter>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<LogIn />} />
                      <Route path="/create-account" element={<CreateAccount />} />
                      <Route path="/create-account-submitted" element={<CreateAccountSubmitted />} />
                      <Route path="/verify-email" element={<CreateAccountSuccessful />} />
                      <Route path="/password-reset" element={<PasswordResetRequest />} />
                      <Route path="/password-reset-confirm" element={<PasswordResetConfirm />} />
                      <Route path="/sign-up" element={<SignUp />} />

                      {/* Protected routes */}
                      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                      <Route path="/find-club" element={<ProtectedRoute><FindClubUpdated /></ProtectedRoute>} />
                      <Route path="/recommend-club" element={<ProtectedRoute><RecommendClubUpdated /></ProtectedRoute>} />
                      <Route path="/submit-club" element={<ProtectedRoute><SubmitClub /></ProtectedRoute>} />
                      <Route path="/golfer-profile" element={<ProtectedRoute><GolferProfileUpdated /></ProtectedRoute>} />
                      <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />

                      {/* Catch all route */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </main>
                <Footer />
                <Analytics />
              </div>
            </BrowserRouter>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { session } = useAuth();
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default App;