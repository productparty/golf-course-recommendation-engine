import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
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
import Typography from '@mui/material/Typography';
import LogIn from './pages/LogIn/LogIn';
import GolferProfile from './pages/GolferProfile/GolferProfile';
import NotFound from './pages/NotFound/NotFound';
import CreateAccountSubmitted from './pages/CreateAccount/CreateAccountSubmitted';
import PasswordResetRequest from './pages/PasswordResetRequest/PasswordResetRequest';
import PasswordResetConfirm from './pages/PasswordResetConfirm/PasswordResetConfirm';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
import { AuthProvider, useAuth } from './context/AuthContext';

const theme = createTheme();

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Routes>
                  <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
                  <Route path="/find-club" element={<RequireAuth><FindClub /></RequireAuth>} />
                  <Route path="/recommend-club" element={<RequireAuth><RecommendClub /></RequireAuth>} />
                  <Route path="/sign-up" element={<SignUp />} />
                  <Route path="/submit-club" element={<RequireAuth><SubmitClub /></RequireAuth>} />
                  <Route path="/create-account" element={<CreateAccount />} />
                  <Route path="/login" element={<LogIn />} />
                  <Route path="/golfer-profile" element={<RequireAuth><GolferProfile /></RequireAuth>} />
                  <Route path="/create-account-submitted" element={<CreateAccountSubmitted />} />
                  <Route path="/password-reset-request" element={<PasswordResetRequest />} />
                  <Route path="/password-reset-confirm" element={<PasswordResetConfirm />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="*" element={<NotFound />} />
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

const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" />;
};

export default App;