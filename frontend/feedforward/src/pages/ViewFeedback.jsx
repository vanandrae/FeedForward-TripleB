import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import HttpService from '../services/HttpService';
import { API_ENDPOINTS } from '../services/ApiConstants';
import ReportButton from '../components/ReportButton';

const ViewFeedback = () => {
  const { isAdmin, isFaculty, isStudent } = useAuth();
  const navigate = useNavigate();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      
      // Admin and Faculty can see ALL feedback
      if (isAdmin || isFaculty) {
        console.log('Fetching all feedback for Admin/Faculty');
        response = await HttpService.get(API_ENDPOINTS.GET_ALL_FEEDBACK);
        console.log('All feedback response:', response);
      } else {
        // Students see only their own feedback
        console.log('Fetching user feedback for Student');
        response = await HttpService.get(API_ENDPOINTS.GET_USER_FEEDBACK);
        console.log('User feedback response:', response);
      }
      
      // Ensure we have an array
      const feedbackArray = Array.isArray(response) ? response : [];
      setFeedbackList(feedbackArray);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('Failed to load feedback. Please refresh the page.');
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isFaculty]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const getStatusColor = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_REVIEW': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'PENDING': return 'PENDING';
      case 'IN_REVIEW': return 'IN REVIEW';
      case 'RESOLVED': return 'RESOLVED';
      default: return upperStatus || 'PENDING';
    }
  };

  // Get display name based on anonymous status
  const getAuthorDisplay = (feedback) => {
    if (feedback.anonymous) {
      return 'Anonymous';
    }
    return feedback.authorName || feedback.authorEmail?.split('@')[0] || 'Anonymous';
  };

  // Apply search filter (Faculty only)
  const filteredBySearch = (feedback) => {
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      feedback.title?.toLowerCase().includes(term) ||
      feedback.description?.toLowerCase().includes(term) ||
      feedback.authorName?.toLowerCase().includes(term) ||
      feedback.category?.toLowerCase().includes(term)
    );
  };

  // Apply status filter
  const filteredFeedback = feedbackList
    .filter(f => {
      // Status filter
      if (filter !== 'all') {
        const feedbackStatus = f.status?.toUpperCase();
        const filterStatus = filter.toUpperCase();
        if (feedbackStatus !== filterStatus) return false;
      }
      // Search filter (Faculty/Admin only)
      if (isFaculty || isAdmin) {
        return filteredBySearch(f);
      }
      return true;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
          <button 
            onClick={() => fetchFeedback()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isAdmin ? 'All Feedback (Admin View)' : isFaculty ? 'All Student Feedback (Faculty View)' : 'My Feedbacks'}
        </h1>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{feedbackList.length}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {feedbackList.filter(f => f.status?.toUpperCase() === 'PENDING').length}
            </div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {feedbackList.filter(f => f.status?.toUpperCase() === 'IN_REVIEW').length}
            </div>
            <div className="text-xs text-gray-500">In Review</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              {feedbackList.filter(f => f.status?.toUpperCase() === 'RESOLVED').length}
            </div>
            <div className="text-xs text-gray-500">Resolved</div>
          </div>
        </div>

        {/* Search Bar - Only for Faculty and Admin */}
        {(isFaculty || isAdmin) && (
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search feedback by title, description, author, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <div className="mt-2 text-sm text-gray-500">
                Found {filteredFeedback.length} result(s) for "{searchTerm}"
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({feedbackList.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({feedbackList.filter(f => f.status?.toUpperCase() === 'PENDING').length})
            </button>
            <button
              onClick={() => setFilter('in_review')}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                filter === 'in_review'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Review ({feedbackList.filter(f => f.status?.toUpperCase() === 'IN_REVIEW').length})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                filter === 'resolved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Resolved ({feedbackList.filter(f => f.status?.toUpperCase() === 'RESOLVED').length})
            </button>
          </div>
        </div>

        {/* Feedback List */}
        {filteredFeedback.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No feedback submissions found</p>
            <p className="text-gray-400 text-sm">Try changing the filter or search term</p>
            {isStudent && (
              <button 
                onClick={() => navigate('/submit-feedback')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Submit Feedback
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((feedback) => (
              <div key={feedback.feedbackId || feedback.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{feedback.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(feedback.status)}`}>
                        {getStatusDisplay(feedback.status)}
                      </span>
                      {feedback.anonymous && (
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-500">
                          🤫 Anonymous
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{feedback.description}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        📁 {feedback.category}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        ⚡ Priority: {feedback.priority || 'MEDIUM'}
                      </span>
                      <span className="text-xs text-gray-400">
                        👤 By: {getAuthorDisplay(feedback)}
                      </span>
                      <span className="text-xs text-gray-400">
                        📅 {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-400">
                        👍 {feedback.votes || 0} votes
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/feedback/${feedback.feedbackId || feedback.id}`)}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition text-sm"
                    >
                      View Details
                    </button>
                    
                    {/* Report button for Faculty ONLY (not admin) */}
                    {isFaculty && !isAdmin && (
                      <ReportButton feedbackId={feedback.feedbackId || feedback.id} feedbackTitle={feedback.title} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewFeedback;