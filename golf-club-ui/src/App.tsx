import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CreateAccount from './pages/CreateAccount/CreateAccount';
import './App.css';
import Header from './components/header';
import Footer from './components/footer';
import Home from './pages/Home/home';
import FindClub from './pages/FindClub/FindClub';
import RecommendClub from './pages/RecommendClub/RecommendClub';
import SignUp from './pages/SignUp/signUp';
import SubmitClub from './pages/SubmitClub/submitClub';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LogIn from './pages/LogIn/LogIn';
import GolferProfile from './pages/GolferProfile/GolferProfile';
import NotFound from './pages/NotFound/NotFound';
import CreateAccountSubmitted from './pages/CreateAccount/CreateAccountSubmitted';
import PasswordResetRequest from './pages/PasswordResetRequest/PasswordResetRequest';
import PasswordResetConfirm from './pages/PasswordResetConfirm/PasswordResetConfirm';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './supabaseClient';
import CreateAccountSuccessful from './pages/CreateAccount/CreateAccountSuccessful';

const theme = createTheme();

const App: React.FC = () => {
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Handle successful sign in
      }
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<LogIn />} />
                  <Route path="/create-account" element={<CreateAccount />} />
                  <Route path="/create-account-submitted" element={<CreateAccountSubmitted />} />
                  <Route path="/verify-email" element={<CreateAccountSuccessful />} />
                  <Route path="/password-reset" element={<PasswordResetRequest />} />
                  <Route path="/password-reset-confirm" element={<PasswordResetConfirm />} />
                  <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  <Route path="/find-club" element={<ProtectedRoute><FindClub /></ProtectedRoute>} />
                  <Route path="/recommend-club" element={<ProtectedRoute><RecommendClub /></ProtectedRoute>} />
                  <Route path="/sign-up" element={<SignUp />} />
                  <Route path="/submit-club" element={<ProtectedRoute><SubmitClub /></ProtectedRoute>} />
                  <Route path="/golfer-profile" element={<ProtectedRoute><GolferProfile /></ProtectedRoute>} />
                  <Route path="/reset-password" element={<PasswordResetRequest />} />
                  <Route path="/reset-password/confirm" element={<PasswordResetConfirm />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { session } = useAuth();
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default App;