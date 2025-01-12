// filepath: /d:/projects/golf/golf-course-recommendation-engine/src/App.tsx
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CreateAccount from './pages/CreateAccount/CreateAccount';
import './App.css';
import Header from './components/header';
import Footer from './components/footer';
import Home from './pages/Home/home';
import FindCourse from './pages/FindCourse/findCourse';
import RecommendCourse from './pages/RecommendCourse/recommendCourse';
import SignUp from './pages/SignUp/signUp';
import SubmitCourse from './pages/SubmitCourse/submitCourse';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import LogIn from './pages/LogIn/LogIn';
import GolferProfile from './pages/GolferProfile/GolferProfile';
import NotFound from './pages/NotFound/NotFound'; // Import NotFound component

const theme = createTheme();

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/find-course" element={<FindCourse />} />
                <Route path="/recommend-course" element={<RecommendCourse />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/submit-course" element={<SubmitCourse />} />
                <Route path="/create-account" element={<CreateAccount />} />
                <Route path="/login" element={<LogIn />} />
                <Route path="/golfer-profile" element={<GolferProfile />} />
                <Route path="*" element={<NotFound />} /> {/* Catch-all route */}
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;