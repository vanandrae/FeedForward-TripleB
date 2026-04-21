import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import HttpService from '../services/HttpService';
import { API_ENDPOINTS } from '../services/ApiConstants';

const FeedbackDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isFaculty } = useAuth(); // Removed unused 'user'
  const [feedback, setFeedback] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
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
    
    try {
      await HttpService.post(`/feedback/${id}/comments`, { comment: newComment });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await HttpService.put(`${API_ENDPOINTS.UPDATE_FEEDBACK_STATUS}/${id}`, { status });
      fetchFeedbackDetails();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleUpvote = async () => {
    try {
      await HttpService.post(`/feedback/${id}/upvote`);
      setUpvoted(true);
      fetchFeedbackDetails();
    } catch (error) {
      console.error('Error upvoting:', error);
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
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                    {feedback.status || 'PENDING'}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {feedback.category}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    Priority: {feedback.priority}
                  </span>
                </div>
              </div>
              
              {(isAdmin || isFaculty) && (
                <select
                  value={feedback.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className="px-3 py-1 border rounded-lg text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="resolved">Resolved</option>
                </select>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600">{feedback.description}</p>
            </div>

            <div className="flex gap-4 text-sm text-gray-500 mb-6 pb-4 border-b">
              <span>📅 {new Date(feedback.createdAt).toLocaleDateString()}</span>
              <span>👤 {feedback.authorEmail || 'Anonymous'}</span>
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
                {comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-sm">{comment.authorName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>

              <div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a comment..."
                />
                <button
                  onClick={handleAddComment}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetails;