import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [showCommentBox, setShowCommentBox] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [upvoting, setUpvoting] = useState(null);
  const [userUpvotes, setUserUpvotes] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, feedbackResponse] = await Promise.all([
        HttpService.get(API_ENDPOINTS.GET_DASHBOARD_STATS),
        HttpService.get(API_ENDPOINTS.GET_ALL_FEEDBACK)
      ]);

      setStats(statsResponse);
      const feedbacks = feedbackResponse || [];

      const sortedFeedbacks = [...feedbacks].sort((a, b) => {
        const votesA = a.votes || 0;
        const votesB = b.votes || 0;
        if (votesB > votesA) {
          return 1;
        }
        if (votesB < votesA) {
          return -1;
        }
        return 0;
      });
      setAllFeedback(sortedFeedbacks);

      const upvoteStatus = {};
      const commentCountMap = {};

      for (let i = 0; i < sortedFeedbacks.length; i++) {
        const item = sortedFeedbacks[i];
        const id = item.feedbackId || item.id;
        upvoteStatus[id] = item.userHasUpvoted || false;
        commentCountMap[id] = item.commentCount || 0;
      }

      setUserUpvotes(upvoteStatus);
      setCommentCounts(commentCountMap);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...allFeedback];

    const isSearching = searchTerm.trim() !== '';
    if (isSearching) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        const titleMatch = item.title?.toLowerCase().includes(term);
        const descriptionMatch = item.description?.toLowerCase().includes(term);
        const authorMatch = item.authorEmail?.toLowerCase().includes(term);
        return titleMatch || descriptionMatch || authorMatch;
      });
    }

    const isStatusFiltering = statusFilter !== 'all';
    if (isStatusFiltering) {
      filtered = filtered.filter((item) => {
        const itemStatus = item.status?.toLowerCase();
        const filterStatus = statusFilter.toLowerCase();
        return itemStatus === filterStatus;
      });
    }

    const isCategoryFiltering = categoryFilter !== 'all';
    if (isCategoryFiltering) {
      filtered = filtered.filter((item) => {
        const itemCategory = item.category?.toLowerCase();
        const filterCategory = categoryFilter.toLowerCase();
        return itemCategory === filterCategory;
      });
    }

    const sortedFiltered = filtered.sort((a, b) => {
      const votesA = a.votes || 0;
      const votesB = b.votes || 0;
      if (votesB > votesA) {
        return 1;
      }
      if (votesB < votesA) {
        return -1;
      }
      return 0;
    });

    return sortedFiltered;
  }, [allFeedback, searchTerm, statusFilter, categoryFilter]);

  const filteredFeedback = useMemo(() => applyFilters(), [applyFilters]);

  const handleAddComment = async (feedbackId) => {
    const isCommentEmpty = !commentText.trim();
    if (isCommentEmpty || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await HttpService.post(`/feedback/${feedbackId}/comments`, { comment: commentText });
      setCommentText('');
      setShowCommentBox(null);

      const response = await HttpService.get(`/feedback/${feedbackId}/comments`);
      const commentCount = response?.length || 0;
      const updatedCommentCounts = { ...commentCounts };
      updatedCommentCounts[feedbackId] = commentCount;
      setCommentCounts(updatedCommentCounts);

    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleUpvote = async (feedbackId) => {
    const isUpvoting = upvoting === feedbackId;
    if (isUpvoting) {
      return;
    }

    setUpvoting(feedbackId);
    const wasUpvoted = userUpvotes[feedbackId];

    const updatedUserUpvotes = { ...userUpvotes };
    updatedUserUpvotes[feedbackId] = !wasUpvoted;
    setUserUpvotes(updatedUserUpvotes);

    const updatedFeedbackList = allFeedback.map((item) => {
      const itemId = item.feedbackId || item.id;
      if (itemId === feedbackId) {
        const currentVotes = item.votes || 0;
        const newVotes = wasUpvoted ? currentVotes - 1 : currentVotes + 1;
        const updatedItem = { ...item, votes: newVotes };
        return updatedItem;
      }
      return item;
    });
    setAllFeedback(updatedFeedbackList);

    try {
      const response = await HttpService.post(`/feedback/${feedbackId}/upvote`, {});
      const finalUpvoteStatus = response.upvoted;
      const finalVotes = response.votes;
      
      const finalUserUpvotes = { ...userUpvotes };
      finalUserUpvotes[feedbackId] = finalUpvoteStatus;
      setUserUpvotes(finalUserUpvotes);
      
      const finalFeedbackList = allFeedback.map((item) => {
        const itemId = item.feedbackId || item.id;
        if (itemId === feedbackId) {
          const updatedItem = { ...item, votes: finalVotes };
          return updatedItem;
        }
        return item;
      });
      setAllFeedback(finalFeedbackList);
    } catch (error) {
      const revertedUserUpvotes = { ...userUpvotes };
      revertedUserUpvotes[feedbackId] = wasUpvoted;
      setUserUpvotes(revertedUserUpvotes);
      
      const revertedFeedbackList = allFeedback.map((item) => {
        const itemId = item.feedbackId || item.id;
        if (itemId === feedbackId) {
          const currentVotes = item.votes || 0;
          const revertedVotes = wasUpvoted ? currentVotes + 1 : currentVotes - 1;
          const revertedItem = { ...item, votes: revertedVotes };
          return revertedItem;
        }
        return item;
      });
      setAllFeedback(revertedFeedbackList);
      console.error('Error toggling upvote:', error);
    } finally {
      setUpvoting(null);
    }
  };

  const getStatusColor = useCallback((status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (statusLower === 'in_review') {
      return 'bg-blue-100 text-blue-800';
    }
    if (statusLower === 'resolved') {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-gray-100 text-gray-800';
  }, []);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  const handleViewDetails = (feedbackId) => {
    navigate(`/feedback/${feedbackId}`);
  };

  const getWelcomeMessage = () => {
    if (isStudent) {
      return 'See what others are saying. Upvote and comment on feedback!';
    }
    return 'Track and manage all feedback submissions';
  };

  const getButtonUpvoteText = (feedbackItem, hasUpvoted, isUpvotingFeedback) => {
    const votes = feedbackItem.votes || 0;
    if (isUpvotingFeedback) {
      return '... ' + votes;
    }
    return votes;
  };

  const getCommentButtonText = (commentCount) => {
    if (commentCount === 1) {
      return commentCount + ' Comment';
    }
    return commentCount + ' Comments';
  };

  const isLoading = loading;
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const displayFeedback = filteredFeedback.slice(0, 20);
  const hasNoFeedback = displayFeedback.length === 0;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="welcome-banner">
          <h2 className="welcome-title">Welcome, {user?.fullName || 'User'}!</h2>
          <p className="welcome-text">
            {getWelcomeMessage()}
          </p>
        </div>

        <div className="stats-container">
          <div className="stat-card theme-gradient-bg">
            <div className="stat-number">{stats.totalFeedback}</div>
            <div className="stat-label">Total Feedback</div>
            <div className="stat-sub">All submissions</div>
          </div>
          <div className="stat-card theme-gradient-bg" style={{ opacity: 0.95 }}>
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
            <div className="stat-sub">Awaiting review</div>
          </div>
          <div className="stat-card theme-gradient-bg" style={{ opacity: 0.9 }}>
            <div className="stat-number">{stats.inReview}</div>
            <div className="stat-label">In Review</div>
            <div className="stat-sub">Being processed</div>
          </div>
          <div className="stat-card theme-gradient-bg" style={{ opacity: 0.85 }}>
            <div className="stat-number">{stats.resolved}</div>
            <div className="stat-label">Resolved</div>
            <div className="stat-sub">Completed</div>
          </div>
        </div>

        <div className="quick-actions">
          <h3 className="actions-title">Quick Actions</h3>
          <div className="actions-container">
            {isStudent && (
              <div onClick={() => navigate('/submit-feedback')} className="action-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#0A3A66] rounded-lg flex items-center justify-center">
                    <span className="text-xl">+</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Submit Feedback</h4>
                    <p className="text-gray-500 text-sm">Share your thoughts</p>
                  </div>
                </div>
              </div>
            )}
            <div onClick={() => navigate('/feedback')} className="action-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-[#0A3A66] rounded-lg flex items-center justify-center">
                  <span className="text-xl"></span>
                </div>
                <div>
                  <h4 className="font-semibold">View All Feedback</h4>
                  <p className="text-gray-500 text-sm">See all submissions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Community Feedback Feed</h3>

          <input
            type="text"
            placeholder="Search by title, description, or author email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#1B5E9C]"
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

            {(() => {
              const hasActiveFilters = searchTerm || statusFilter !== 'all' || categoryFilter !== 'all';
              if (hasActiveFilters) {
                return (
                  <button onClick={clearFilters} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm">
                    Clear Filters X
                  </button>
                );
              }
              return null;
            })()}
          </div>

          <p className="text-sm text-gray-500">Showing {displayFeedback.length} of {allFeedback.length} feedback items (sorted by most upvotes)</p>
        </div>

        {hasNoFeedback ? (
          <div className="empty-state">
            <div className="text-6xl mb-4"></div>
            <p className="text-gray-500 text-lg">No feedback found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-4 px-6 pb-6">
            {displayFeedback.map((feedbackItem) => {
              const feedbackId = feedbackItem.feedbackId || feedbackItem.id;
              const hasUpvoted = userUpvotes[feedbackId];
              const commentCount = commentCounts[feedbackId] || 0;
              const isUpvotingFeedback = upvoting === feedbackId;

              return (
                <div key={feedbackId} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{feedbackItem.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">By: {feedbackItem.authorName || feedbackItem.authorEmail?.split('@')[0] || 'Anonymous'}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(feedbackItem.status)}`}>
                            {feedbackItem.status || 'PENDING'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(feedbackId)}
                      className="px-3 py-1 theme-text hover:bg-blue-50 rounded text-sm transition"
                    >
                      View Details →
                    </button>
                  </div>

                  <p className="text-gray-600 text-sm mt-2 mb-2 line-clamp-2">{feedbackItem.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <button 
                      onClick={() => handleToggleUpvote(feedbackId)} 
                      disabled={isUpvotingFeedback}
                      className={`flex items-center gap-1 ${hasUpvoted ? 'theme-text font-medium' : 'text-gray-500 hover:theme-text'}`}
                    >
                      <span></span>
                      {getButtonUpvoteText(feedbackItem, hasUpvoted, isUpvotingFeedback)}
                    </button>
                    <button 
                      onClick={() => {
                        const isSameBox = showCommentBox === feedbackId;
                        if (isSameBox) {
                          setShowCommentBox(null);
                        } else {
                          setShowCommentBox(feedbackId);
                        }
                      }}
                      className="flex items-center gap-1 text-gray-500 hover:theme-text"
                    >
    
                      {getCommentButtonText(commentCount)}
                    </button>
                  </div>

                  {(() => {
                    const isCommentBoxOpen = showCommentBox === feedbackId;
                    if (isCommentBoxOpen) {
                      return (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={commentText} 
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Write a comment..." 
                              disabled={submitting}
                              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E9C]" 
                            />
                            <button 
                              onClick={() => handleAddComment(feedbackId)} 
                              disabled={submitting}
                              className="theme-button text-sm disabled:opacity-50"
                            >
                              {submitting ? '...' : 'Post'}
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
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