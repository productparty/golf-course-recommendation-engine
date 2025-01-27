import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Home from '../pages/Home/home';
import LogIn from '../pages/LogIn/LogIn';
import CreateAccount from '../pages/CreateAccount/CreateAccount';
import GolferProfileUpdated from '../pages/GolferProfile/GolferProfileUpdated';
import { ClubDetailPage } from '../components/ClubDetailPage';
import FindClubUpdated from '../pages/FindClub/FindClubUpdated';
import RecommendClubUpdated from '../pages/RecommendClub/RecommendClubUpdated';
import Favorites from '../pages/Favorites/Favorites';
import CreateAccountSubmitted from '../pages/CreateAccount/CreateAccountSubmitted';
import SubmitClub from '../pages/SubmitClub/submitClub';
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
        <Route path="/create-account-submitted" element={<CreateAccountSubmitted />} />
        <Route path="/golfer-profile" element={<GolferProfileUpdated />} />
        <Route path="/find-club" element={<FindClubUpdated />} />
        <Route path="/recommend-club" element={<RecommendClubUpdated />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/submit-club" element={<SubmitClub />} />
        <Route path="/clubs/:id" element={<ClubDetailPage />} />
        {/* Add other routes */}
      </Routes>
      <Footer />
    </>
  );
};

export default AppRoutes; 