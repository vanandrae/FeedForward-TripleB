import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import HttpService from '../services/HttpService';
import { API_ENDPOINTS } from '../services/ApiConstants';
import './Dashboard.css';

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
  const [userUpvotes, setUserUpvotes] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchDashboardData();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...allFeedback];
    
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.authorEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    setFilteredFeedback(filtered);
  }, [allFeedback, searchTerm, statusFilter, categoryFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, feedbackResponse] = await Promise.all([
        HttpService.get(API_ENDPOINTS.GET_DASHBOARD_STATS),
        HttpService.get(API_ENDPOINTS.GET_ALL_FEEDBACK)
      ]);
      
      setStats(statsResponse);
      const feedbacks = feedbackResponse || [];
      setAllFeedback(feedbacks);
      
      // Fetch upvote status in parallel
      const upvotePromises = feedbacks.map(item => 
        HttpService.get(`/feedback/${item.feedbackId || item.id}/has-upvoted`).catch(() => ({ hasUpvoted: false }))
      );
      
      const upvoteResults = await Promise.all(upvotePromises);
      const upvoteStatus = {};
      feedbacks.forEach((item, index) => {
        upvoteStatus[item.feedbackId || item.id] = upvoteResults[index]?.hasUpvoted || false;
      });
      
      setUserUpvotes(upvoteStatus);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (feedbackId) => {
    if (!commentText.trim() || submitting) return;
    
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
      setUserUpvotes(prev => ({ ...prev, [feedbackId]: response.upvoted }));
      setAllFeedback(prev => prev.map(item => 
        (item.feedbackId || item.id) === feedbackId ? { ...item, votes: response.votes } : item
      ));
    } catch (error) {
      console.error('Error toggling upvote:', error);
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

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <h2 className="welcome-title">Welcome, {user?.fullName || 'User'}! 👋</h2>
          <p className="welcome-text">
            {isStudent ? "See what others are saying. Upvote and comment on feedback!" : "Track and manage all feedback submissions"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card bg-gradient-to-r from-indigo-500 to-purple-600">
            <div className="stat-number">{stats.totalFeedback}</div>
            <div className="stat-label">Total Feedback</div>
            <div className="stat-sub">All submissions</div>
          </div>
          <div className="stat-card bg-gradient-to-r from-pink-500 to-rose-500">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
            <div className="stat-sub">Awaiting review</div>
          </div>
          <div className="stat-card bg-gradient-to-r from-cyan-500 to-blue-500">
            <div className="stat-number">{stats.inReview}</div>
            <div className="stat-label">In Review</div>
            <div className="stat-sub">Being processed</div>
          </div>
          <div className="stat-card bg-gradient-to-r from-green-500 to-emerald-500">
            <div className="stat-number">{stats.resolved}</div>
            <div className="stat-label">Resolved</div>
            <div className="stat-sub">Completed</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3 className="actions-title">Quick Actions</h3>
          <div className="actions-container">
            {isStudent && (
              <div onClick={() => navigate('/submit-feedback')} className="action-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-xl">📝</div>
                  <div>
                    <h4 className="font-semibold">Submit Feedback</h4>
                    <p className="text-gray-500 text-sm">Share your thoughts</p>
                  </div>
                </div>
              </div>
            )}
            <div onClick={() => navigate('/feedback')} className="action-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-xl">👁️</div>
                <div>
                  <h4 className="font-semibold">View All Feedback</h4>
                  <p className="text-gray-500 text-sm">See all submissions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Community Feedback Feed</h3>
          
          <input
            type="text"
            placeholder="🔍 Search by title, description, or author email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="flex flex-wrap gap-3 mb-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
            </select>
            
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              <option value="all">All Categories</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="improvement">Improvement</option>
              <option value="feedback">General Feedback</option>
            </select>
            
            {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <button onClick={clearFilters} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm">
                Clear Filters ✕
              </button>
            )}
          </div>
          
          <p className="text-sm text-gray-500">Showing {filteredFeedback.length} of {allFeedback.length} feedback items</p>
        </div>

        {/* Feedback Feed */}
        {filteredFeedback.length === 0 ? (
          <div className="empty-state">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No feedback found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-4 px-6 pb-6">
            {filteredFeedback.map((feedbackItem) => {
              const feedbackId = feedbackItem.feedbackId || feedbackItem.id;
              const hasUpvoted = userUpvotes[feedbackId];
              
              return (
                <div key={feedbackId} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(feedbackItem.category)}</span>
                      <div>
                        <h4 className="font-semibold text-gray-800">{feedbackItem.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">By: {feedbackItem.authorEmail || 'Anonymous'}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(feedbackItem.status)}`}>
                            {feedbackItem.status || 'PENDING'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(feedbackItem.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-gray-600 text-sm mt-2 mb-2 line-clamp-2">{feedbackItem.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <button onClick={() => handleToggleUpvote(feedbackId)} disabled={upvoting === feedbackId} 
                      className={`flex items-center gap-1 ${hasUpvoted ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-blue-600'}`}>
                      {upvoting === feedbackId ? '⏳' : '👍'} {feedbackItem.votes || 0}
                    </button>
                    <button onClick={() => setShowCommentBox(showCommentBox === feedbackId ? null : feedbackId)} 
                      className="flex items-center gap-1 text-gray-500 hover:text-blue-600">
                      💬 {feedbackItem.commentCount || 0}
                    </button>
                  </div>

                  {showCommentBox === feedbackId && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex gap-2">
                        <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} 
                          placeholder="Write a comment..." disabled={submitting}
                          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button onClick={() => handleAddComment(feedbackId)} disabled={submitting}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                          {submitting ? '...' : 'Post'}
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
    </div>
  );
};

export default Dashboard;