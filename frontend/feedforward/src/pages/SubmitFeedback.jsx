import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import HttpService from '../services/HttpService';
import { API_ENDPOINTS } from '../services/ApiConstants';

const SubmitFeedback = () => {
  const { user, isStudent, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: 'bug',
    description: '',
    priority: 'medium'
  });


  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await HttpService.post(API_ENDPOINTS.CREATE_FEEDBACK, {
        ...formData,
        authorEmail: user?.email
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Enter feedback title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Category *</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="bug">🐛 Bug Report</option>
                <option value="feature">✨ Feature Request</option>
                <option value="improvement">📈 Improvement</option>
                <option value="feedback">💬 General Feedback</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Priority</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Description *</label>
              <textarea 
                rows="6" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Provide detailed information about your feedback..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                required 
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
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