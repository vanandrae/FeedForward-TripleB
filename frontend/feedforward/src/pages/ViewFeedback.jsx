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

  const fetchFeedback = useCallback(async () => {
    try {
      let response;
      
      // Admin and Faculty can see ALL feedback
      if (isAdmin || isFaculty) {
        response = await HttpService.get(API_ENDPOINTS.GET_ALL_FEEDBACK);
        console.log('All feedback (Admin/Faculty):', response);
      } else {
        // Students see only their own feedback
        response = await HttpService.get(API_ENDPOINTS.GET_USER_FEEDBACK);
        console.log('My feedback (Student):', response);
      }
      
      setFeedbackList(response || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isFaculty]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFeedback = filter === 'all' 
    ? feedbackList 
    : feedbackList.filter(f => f.status?.toLowerCase() === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isAdmin ? 'All Feedback (Admin View)' : isFaculty ? 'All Student Feedback (Faculty View)' : 'My Feedback'}
        </h1>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'in_review', 'resolved'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg capitalize transition ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback List */}
        {filteredFeedback.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No feedback submissions yet</p>
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
                        {feedback.status || 'PENDING'}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{feedback.description}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {feedback.category}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        Priority: {feedback.priority}
                      </span>
                      <span className="text-xs text-gray-400">
                        By: {feedback.authorEmail || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-400">
                        Submitted: {new Date(feedback.createdAt).toLocaleDateString()}
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
                    
                    {/* Report button for Faculty and Admin */}
                    {(isFaculty || isAdmin) && (
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