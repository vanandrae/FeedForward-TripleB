// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import HttpService from '../services/HttpService';
import { API_ENDPOINTS } from '../services/ApiConstants';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFeedback: 0,
    pending: 0,
    inReview: 0,
    resolved: 0
  });
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsResponse = await HttpService.get(API_ENDPOINTS.GET_DASHBOARD_STATS);
      setStats(statsResponse);
      
      const feedbackResponse = await HttpService.get(API_ENDPOINTS.GET_USER_FEEDBACK);
      setRecentFeedback(feedbackResponse.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = () => {
    navigate('/submit-feedback');
  };

  const handleViewAllFeedback = () => {
    navigate('/feedback');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-6 text-white">
        <h2 className="text-3xl font-bold">Welcome, {user?.fullName || 'User'}! 👋</h2>
        <p className="mt-2 opacity-90">Track and manage your feedback submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="dashboard-stats-card bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white shadow">
          <div className="text-3xl font-bold">{stats.totalFeedback}</div>
          <div className="text-sm mt-2">Total Feedback</div>
          <div className="text-xs opacity-70">All submissions</div>
        </div>
        <div className="dashboard-stats-card bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg p-4 text-white shadow">
          <div className="text-3xl font-bold">{stats.pending}</div>
          <div className="text-sm mt-2">Pending</div>
          <div className="text-xs opacity-70">Awaiting review</div>
        </div>
        <div className="dashboard-stats-card bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-4 text-white shadow">
          <div className="text-3xl font-bold">{stats.inReview}</div>
          <div className="text-sm mt-2">In Review</div>
          <div className="text-xs opacity-70">Being processed</div>
        </div>
        <div className="dashboard-stats-card bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white shadow">
          <div className="text-3xl font-bold">{stats.resolved}</div>
          <div className="text-sm mt-2">Resolved</div>
          <div className="text-xs opacity-70">Completed</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={handleSubmitFeedback}
            className="bg-white p-4 rounded-lg shadow border hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Submit Feedback</h4>
                <p className="text-gray-500 text-sm">Share your thoughts and suggestions</p>
              </div>
            </div>
          </div>
          <div 
            onClick={handleViewAllFeedback}
            className="bg-white p-4 rounded-lg shadow border hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">👁️</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">View All Feedback</h4>
                <p className="text-gray-500 text-sm">See all your submitted feedback</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-semibold text-gray-800">Recent Feedback</h3>
          <button 
            onClick={handleViewAllFeedback}
            className="text-blue-600 text-sm hover:text-blue-700"
          >
            View All →
          </button>
        </div>
        {recentFeedback.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No feedback yet</p>
            <p className="text-gray-400 text-sm mb-4">Start by submitting your first feedback</p>
            <button 
              onClick={handleSubmitFeedback}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Submit Feedback
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentFeedback.map((feedback) => (
              <div key={feedback.feedbackId} className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold text-gray-800">{feedback.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{feedback.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{feedback.status}</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{feedback.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;