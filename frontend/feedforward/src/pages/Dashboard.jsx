import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import HttpService from '../services/HttpService';
import { API_ENDPOINTS } from '../services/ApiConstants';

const Dashboard = () => {
  const { user, isStudent } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFeedback: 0,
    pending: 0,
    inReview: 0,
    resolved: 0
  });
  const [allFeedback, setAllFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCommentBox, setShowCommentBox] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [upvoting, setUpvoting] = useState(null);
  const [userUpvotes, setUserUpvotes] = useState({}); // Track which feedback user has upvoted
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

// Add smooth scrolling effect when navigating
useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...allFeedback];
    
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(feedback => 
        feedback.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.authorEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(feedback => 
        feedback.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(feedback => 
        feedback.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    setFilteredFeedback(filtered);
  }, [allFeedback, searchTerm, statusFilter, categoryFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchDashboardData = async () => {
    try {
      const statsResponse = await HttpService.get(API_ENDPOINTS.GET_DASHBOARD_STATS);
      setStats(statsResponse);
      
      const feedbackResponse = await HttpService.get(API_ENDPOINTS.GET_ALL_FEEDBACK);
      setAllFeedback(feedbackResponse || []);
      
      // Fetch upvote status for each feedback
      const upvoteStatus = {};
      for (const feedback of (feedbackResponse || [])) {
        try {
          const response = await HttpService.get(`/feedback/${feedback.feedbackId || feedback.id}/has-upvoted`);
          upvoteStatus[feedback.feedbackId || feedback.id] = response.hasUpvoted;
        } catch (error) {
          console.error('Error fetching upvote status:', error);
        }
      }
      setUserUpvotes(upvoteStatus);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (feedbackId) => {
    if (!commentText.trim()) {
      alert('Please enter a comment');
      return;
    }
    
    if (submitting) return;
    
    setSubmitting(true);
    try {
      await HttpService.post(`/feedback/${feedbackId}/comments`, { comment: commentText });
      setCommentText('');
      setShowCommentBox(null);
      await fetchDashboardData();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleUpvote = async (feedbackId) => {
    if (upvoting === feedbackId) return;
    
    setUpvoting(feedbackId);
    try {
      const response = await HttpService.post(`/feedback/${feedbackId}/upvote`, {});
      
      // Update local state
      setUserUpvotes(prev => ({
        ...prev,
        [feedbackId]: response.upvoted
      }));
      
      // Update feedback list with new vote count
      setAllFeedback(prev => prev.map(f => {
        if ((f.feedbackId || f.id) === feedbackId) {
          return { ...f, votes: response.votes };
        }
        return f;
      }));
    } catch (error) {
      console.error('Error toggling upvote:', error);
      alert('Failed to update upvote');
    } finally {
      setUpvoting(null);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'bug': return '🐛';
      case 'feature': return '✨';
      case 'improvement': return '📈';
      default: return '💬';
    }
  };

  const handleSubmitFeedback = () => {
    navigate('/submit-feedback');
  };

  const handleViewAllFeedback = () => {
    navigate('/feedback');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
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
        <p className="mt-2 opacity-90">
          {isStudent 
            ? "See what others are saying. Upvote and comment on feedback!"
            : "Track and manage all feedback submissions"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white shadow">
          <div className="text-3xl font-bold">{stats.totalFeedback}</div>
          <div className="text-sm mt-2">Total Feedback</div>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg p-4 text-white shadow">
          <div className="text-3xl font-bold">{stats.pending}</div>
          <div className="text-sm mt-2">Pending</div>
        </div>
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-4 text-white shadow">
          <div className="text-3xl font-bold">{stats.inReview}</div>
          <div className="text-sm mt-2">In Review</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white shadow">
          <div className="text-3xl font-bold">{stats.resolved}</div>
          <div className="text-sm mt-2">Resolved</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isStudent && (
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
                  <p className="text-gray-500 text-sm">Share your thoughts</p>
                </div>
              </div>
            </div>
          )}
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
                <p className="text-gray-500 text-sm">See all submissions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Community Feedback Feed</h3>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Search by title, description, or author email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="improvement">Improvement</option>
            <option value="feedback">General Feedback</option>
          </select>
          
          {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition"
            >
              Clear Filters ✕
            </button>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-3">
          Showing {filteredFeedback.length} of {allFeedback.length} feedback items
        </p>
      </div>

      {/* Feedback Feed */}
      {filteredFeedback.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-lg">No feedback found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
          {isStudent && (
            <button 
              onClick={handleSubmitFeedback}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Submit Feedback
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((feedback) => {
            const feedbackId = feedback.feedbackId || feedback.id;
            const hasUpvoted = userUpvotes[feedbackId];
            
            return (
              <div key={feedbackId} className="bg-white rounded-lg shadow p-5 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(feedback.category)}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{feedback.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          By: {feedback.authorEmail || 'Anonymous'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(feedback.status)}`}>
                          {feedback.status || 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mt-2 mb-3">{feedback.description}</p>

                <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                  <button 
                    onClick={() => handleToggleUpvote(feedbackId)}
                    disabled={upvoting === feedbackId}
                    className={`flex items-center gap-1 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      hasUpvoted ? 'text-blue-600 font-medium' : 'hover:text-blue-600'
                    }`}
                  >
                    {upvoting === feedbackId ? (
                      <span className="inline-block animate-spin">⏳</span>
                    ) : (
                      hasUpvoted ? '👍' : '👍'
                    )} {feedback.votes || 0} Upvotes
                  </button>
                  <button 
                    onClick={() => setShowCommentBox(showCommentBox === feedbackId ? null : feedbackId)}
                    className="flex items-center gap-1 hover:text-blue-600 transition"
                  >
                    💬 {(feedback.commentCount || 0)} Comments
                  </button>
                </div>

                {showCommentBox === feedbackId && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        disabled={submitting}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <button
                        onClick={() => handleAddComment(feedbackId)}
                        disabled={submitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Sending...' : 'Post'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;