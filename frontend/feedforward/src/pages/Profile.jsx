// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import HttpService from '../services/HttpService';
import { API_ENDPOINTS } from '../services/ApiConstants';

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState({
    userId: '',
    fullName: '',
    email: '',
    role: '',
    department: '',
    createdAt: ''
  });
  const [formData, setFormData] = useState({
    fullName: '',
    department: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, navigate]);

  const fetchProfile = async () => {
    setFetching(true);
    setError('');
    try {
      const response = await HttpService.get(API_ENDPOINTS.GET_USER_PROFILE);
      console.log('Profile response:', response);
      
      // Handle both possible response formats
      setProfile({
        userId: response.userId || response.id || '',
        fullName: response.fullName || response.name || '',
        email: response.email || '',
        role: response.role || 'student',
        department: response.department || '',
        createdAt: response.createdAt || response.created_at || ''
      });
      
      setFormData({
        fullName: response.fullName || response.name || '',
        department: response.department || '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message || 'Failed to load profile');
    } finally {
      setFetching(false);
    }
  };

  const handleUpdateProfile = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updateData = {
        fullName: formData.fullName,
        department: formData.department
      };

      // Only include password if user wants to change it
      if (formData.newPassword) {
        if (formData.newPassword.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }
        updateData.password = formData.newPassword;
      }

      await HttpService.put(API_ENDPOINTS.UPDATE_USER_PROFILE, updateData);
      
      // Update local user data
      const updatedUser = { 
        ...user, 
        fullName: formData.fullName, 
        department: formData.department 
      };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      setSuccess('Profile updated successfully!');
      setEditing(false);
      
      // Refresh profile data
      await fetchProfile();
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: ''
      }));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      fullName: profile.fullName || '',
      department: profile.department || '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'faculty': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin': return '👑';
      case 'faculty': return '👨‍🏫';
      case 'student': return '🎓';
      default: return '👤';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold backdrop-blur-sm">
                {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{profile.fullName || 'User'}</h1>
                <p className="text-white/90">{profile.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(profile.role)} bg-white/20 backdrop-blur-sm`}>
                    <span>{getRoleIcon(profile.role)}</span>
                    <span>{profile.role?.toUpperCase() || 'STUDENT'}</span>
                  </span>
                  {profile.department && profile.department !== 'Not specified' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
                      <span>🏢</span>
                      <span>{profile.department}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border-l-4 border-green-500">
                ✅ {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border-l-4 border-red-500">
                ❌ {error}
              </div>
            )}

            {!editing ? (
              // View Mode
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-b pb-3">
                    <label className="block text-gray-500 text-sm mb-1">Full Name</label>
                    <p className="text-gray-800 font-medium text-lg">{profile.fullName || 'Not set'}</p>
                  </div>
                  <div className="border-b pb-3">
                    <label className="block text-gray-500 text-sm mb-1">Email Address</label>
                    <p className="text-gray-800 font-medium">{profile.email}</p>
                  </div>
                  <div className="border-b pb-3">
                    <label className="block text-gray-500 text-sm mb-1">Role</label>
                    <p className="text-gray-800 font-medium capitalize flex items-center gap-2">
                      {getRoleIcon(profile.role)} {profile.role || 'Student'}
                    </p>
                  </div>
                  <div className="border-b pb-3">
                    <label className="block text-gray-500 text-sm mb-1">Department</label>
                    <p className="text-gray-800 font-medium">{profile.department || 'Not specified'}</p>
                  </div>
                  <div className="border-b pb-3">
                    <label className="block text-gray-500 text-sm mb-1">Member Since</label>
                    <p className="text-gray-800 font-medium">{formatDate(profile.createdAt)}</p>
                  </div>
                  <div className="border-b pb-3">
                    <label className="block text-gray-500 text-sm mb-1">User ID</label>
                    <p className="text-gray-800 font-mono text-sm">#{profile.userId || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    ✏️ Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Computer Science, Engineering, Business"
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    🔒 Change Password (Optional)
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">New Password</label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Leave blank to keep current password"
                      />
                      <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm your new password"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? '⏳ Saving...' : '💾 Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📊 Account Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">-</div>
              <div className="text-sm text-gray-600 mt-1">Total Feedback</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">-</div>
              <div className="text-sm text-gray-600 mt-1">Resolved</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">-</div>
              <div className="text-sm text-gray-600 mt-1">Pending</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">-</div>
              <div className="text-sm text-gray-600 mt-1">In Review</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;