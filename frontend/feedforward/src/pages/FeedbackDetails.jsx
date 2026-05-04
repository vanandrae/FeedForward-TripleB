import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import HttpService from '../services/HttpService';
import { API_ENDPOINTS } from '../services/ApiConstants';

const FeedbackDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isFaculty } = useAuth();
  const [feedback, setFeedback] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [upvoted, setUpvoted] = useState(false);

  const fetchFeedbackDetails = useCallback(async () => {
    try {
      const response = await HttpService.get(`${API_ENDPOINTS.GET_FEEDBACK_BY_ID}/${id}`);
      setFeedback(response);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await HttpService.get(`/feedback/${id}/comments`);
      setComments(response || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  }, [id]);

  useEffect(() => {
    fetchFeedbackDetails();
    fetchComments();
  }, [fetchFeedbackDetails, fetchComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (submitting) return;
    
    setSubmitting(true);
    try {
      await HttpService.post(`/feedback/${id}/comments`, { 
        comment: newComment,
        anonymous: isAnonymous
      });
      setNewComment('');
      setIsAnonymous(false);
      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await HttpService.put(`/feedback/${id}/status`, { status });
      await fetchFeedbackDetails();
      alert(`Status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleUpvote = async () => {
    if (upvoted) return;
    setUpvoted(true);
    try {
      await HttpService.post(`/feedback/${id}/upvote`);
      fetchFeedbackDetails();
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

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

  const getAuthorDisplay = () => {
    if (!feedback) return 'Anonymous';
    if (feedback.anonymous) return 'Anonymous';
    return feedback.authorName || feedback.authorEmail?.split('@')[0] || 'Anonymous';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Feedback not found</p>
          <button onClick={() => navigate('/feedback')} className="mt-4 text-blue-600">
            Back to Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button 
          onClick={() => navigate('/feedback')}
          className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Back to Feedback
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{feedback.title}</h1>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                    {getStatusDisplay(feedback.status)}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {feedback.category}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    Priority: {feedback.priority || 'MEDIUM'}
                  </span>
                  {feedback.anonymous && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                      🤫 Anonymous
                    </span>
                  )}
                </div>
              </div>
              
              {(isAdmin || isFaculty) && (
                <select
                  value={feedback.status?.toLowerCase() || 'pending'}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className="px-3 py-1 border rounded-lg text-sm"
                >
                  <option value="pending">PENDING</option>
                  <option value="in_review">IN REVIEW</option>
                  <option value="resolved">RESOLVED</option>
                </select>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600">{feedback.description}</p>
            </div>

            <div className="flex gap-4 text-sm text-gray-500 mb-6 pb-4 border-b">
              <span>📅 {new Date(feedback.createdAt).toLocaleDateString()}</span>
              <span>👤 By: {getAuthorDisplay()}</span>
            </div>

            <div className="mb-6">
              <button
                onClick={handleUpvote}
                disabled={upvoted}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50"
              >
                👍 {feedback.votes || 0} Upvotes
              </button>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-700 mb-4">
                Comments ({comments.length})
              </h3>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                          {!comment.isAnonymous && comment.profilePicture ? (
                            <img 
                              src={comment.profilePicture} 
                              alt={comment.authorName} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {!comment.isAnonymous ? (comment.authorName?.charAt(0).toUpperCase() || '?') : '?'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-sm">
                            {comment.isAnonymous ? 'Anonymous' : comment.authorName}
                          </span>
                          {comment.isAnonymous && (
                            <span className="text-xs text-gray-400 ml-2">🤫</span>
                          )}
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm ml-11">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Section */}
              <div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows="3"
                  disabled={submitting}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Add a comment..."
                />
                
                <div className="flex items-center justify-between mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      Post anonymously
                      <span className="text-xs text-gray-400 ml-1">(your name won't be shown)</span>
                    </span>
                  </label>
                  
                  <button
                    onClick={handleAddComment}
                    disabled={submitting || !newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Posting...
                      </>
                    ) : (
                      'Post Comment'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetails;