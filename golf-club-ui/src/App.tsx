import React from 'react';
import './App.css';
import Header from './components/header';
import Footer from './components/footer';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/home';
import FindCourse from './pages/FindCourse/findCourse';
import RecommendCourse from './pages/RecommendCourse/recommendCourse';
import SignUp from './pages/SignUp/signUp';
import SubmitCourse from './pages/SubmitCourse/submitCourse';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
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
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
