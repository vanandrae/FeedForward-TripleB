import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import SubmitFeedback from '../pages/SubmitFeedback';
import ViewFeedback from '../pages/ViewFeedback';
import FeedbackDetails from '../pages/FeedbackDetails';
import Profile from '../pages/Profile';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppRouter = () => {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Navbar />
          <div className="mt-16">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/submit-feedback" element={<SubmitFeedback />} />
              <Route path="/feedback" element={<ViewFeedback />} />
              <Route path="/feedback/:id" element={<FeedbackDetails />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default AppRouter;