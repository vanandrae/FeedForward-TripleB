import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import SubmitFeedback from './pages/SubmitFeedback';
import ViewFeedback from './pages/ViewFeedback';
import FeedbackDetails from './pages/FeedbackDetails';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import AdminReports from './pages/AdminReports';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Main layout component (only rendered when authenticated)
const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-y-auto">
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
      </div>
    </div>
  );
};

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isFaculty } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect faculty from dashboard to feedback page
  if (isFaculty && window.location.pathname === '/dashboard') {
    return <Navigate to="/feedback" replace />;
  }
  
  return <MainLayout>{children}</MainLayout>;
};

// Admin only route wrapper
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <MainLayout>{children}</MainLayout>;
};

// Public Route wrapper - Redirects to dashboard if already authenticated
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Main App Content
const AppContent = () => {
  return (
    <Routes>
      {/* Public Routes - Redirect to dashboard if already logged in */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      
      {/* Protected Routes - Only accessible when authenticated */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/submit-feedback" element={
        <ProtectedRoute>
          <SubmitFeedback />
        </ProtectedRoute>
      } />
      <Route path="/feedback" element={
        <ProtectedRoute>
          <ViewFeedback />
        </ProtectedRoute>
      } />
      <Route path="/feedback/:id" element={
        <ProtectedRoute>
          <FeedbackDetails />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      } />
      
      {/* Admin Only Routes */}
      <Route path="/admin/reports" element={
        <AdminRoute>
          <AdminReports />
        </AdminRoute>
      } />
      
      {/* Default redirect - goes to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// Main App with AuthProvider at the very top
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;