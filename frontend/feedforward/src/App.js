// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/AuthContext';
import Dashboard from './pages/Dashboard';
import SubmitFeedback from './pages/SubmitFeedback';
import ViewFeedback from './pages/ViewFeedback';
import FeedbackDetails from './pages/FeedbackDetails';
import Profile from './pages/Profile';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }
  return (
    <Router>
      {user ? (
        <div className="flex">
          <Sidebar />
          <div className="flex-1 ml-64">
            <Navbar />
            <div className="mt-16">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/submit-feedback" element={<SubmitFeedback />} />
                <Route path="/feedback" element={<ViewFeedback />} />
                <Route path="/feedback/:id" element={<FeedbackDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;