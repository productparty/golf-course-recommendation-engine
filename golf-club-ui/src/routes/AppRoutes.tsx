import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Home from '../pages/Home/home';
import LogIn from '../pages/LogIn/LogIn';
import CreateAccount from '../pages/CreateAccount/CreateAccount';
import GolferProfileUpdated from '../pages/GolferProfile/GolferProfileUpdated';
import { ClubDetailPage } from '../components/ClubDetailPage';
// Import other components...

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/golfer-profile" element={<GolferProfileUpdated />} />
        <Route path="/clubs/:id" element={<ClubDetailPage />} />
        {/* Add other routes */}
      </Routes>
      <Footer />
    </>
  );
};

export default AppRoutes; 