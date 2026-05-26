import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import HttpService from '../services/HttpService';
import { API_ENDPOINTS } from '../services/ApiConstants';

const SubmitFeedback = () => {
  const { isStudent, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: 'bug',
    description: '',
    priority: 'medium',
    anonymous: false
  });

  const isFaculty = false;
  const isAllowed = isStudent || isAdmin;
  const isAuthenticatedUser = isAuthenticated;

  if (!isAllowed && isAuthenticatedUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-gray-600 mt-2">Only students and admins can submit feedback.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="theme-button mt-4"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await HttpService.post(API_ENDPOINTS.CREATE_FEEDBACK, {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        priority: formData.priority,
        anonymous: formData.anonymous
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      const errorMessage = err.message || 'Failed to submit feedback';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    const updatedForm = { ...formData };
    updatedForm[field] = value;
    setFormData(updatedForm);
  };

  const getCategoryIcon = (categoryValue) => {
    if (categoryValue === 'bug') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8V4M8 12H4M16 12H20M6 6L8 8M18 6L16 8M6 18L8 16M18 18L16 16M12 20V16M12 8a4 4 0 0 0 0 8 4 4 0 0 0 0-8z"/>
        </svg>
      );
    }
    if (categoryValue === 'feature') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2z"/>
        </svg>
      );
    }
    if (categoryValue === 'improvement') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <path d="M12 22V12"/>
          <path d="M9 10.5L12 8L15 10.5"/>
        </svg>
      );
    }
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    );
  };

  const getPriorityIcon = (priorityValue) => {
    if (priorityValue === 'low') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      );
    }
    if (priorityValue === 'high') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
      );
    }
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
      </svg>
    );
  };

  const getCategoryDisplayText = (categoryValue) => {
    if (categoryValue === 'bug') {
      return 'Bug Report';
    }
    if (categoryValue === 'feature') {
      return 'Feature Request';
    }
    if (categoryValue === 'improvement') {
      return 'Improvement';
    }
    return 'General Feedback';
  };

  const getPriorityDisplayText = (priorityValue) => {
    if (priorityValue === 'low') {
      return 'Low';
    }
    if (priorityValue === 'high') {
      return 'High';
    }
    return 'Medium';
  };

  const getButtonText = () => {
    if (loading) {
      return 'Submitting...';
    }
    return 'Submit Feedback';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Submit Feedback</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Title *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E9C]"
                placeholder="Enter feedback title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Category *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E9C]"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="bug">
                  {getCategoryIcon('bug')} {getCategoryDisplayText('bug')}
                </option>
                <option value="feature">
                  {getCategoryIcon('feature')} {getCategoryDisplayText('feature')}
                </option>
                <option value="improvement">
                  {getCategoryIcon('improvement')} {getCategoryDisplayText('improvement')}
                </option>
                <option value="feedback">
                  {getCategoryIcon('feedback')} {getCategoryDisplayText('feedback')}
                </option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Priority</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E9C]"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                <option value="low">
                  {getPriorityIcon('low')} {getPriorityDisplayText('low')}
                </option>
                <option value="medium">
                  {getPriorityIcon('medium')} {getPriorityDisplayText('medium')}
                </option>
                <option value="high">
                  {getPriorityIcon('high')} {getPriorityDisplayText('high')}
                </option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Description *</label>
              <textarea
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E9C]"
                placeholder="Provide detailed information about your feedback..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.anonymous}
                  onChange={(e) => handleInputChange('anonymous', e.target.checked)}
                  className="w-5 h-5 theme-text rounded focus:ring-[#1B5E9C]"
                />
                <span className="text-gray-700">
                  <span className="font-medium">Submit anonymously</span>
                  <span className="text-sm text-gray-500 ml-2">- Your name will not be shown publicly</span>
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="theme-button transition disabled:opacity-50"
              >
                {getButtonText()}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitFeedback;