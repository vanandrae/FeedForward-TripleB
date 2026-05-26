import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import HttpService from '../services/HttpService';
import { API_ENDPOINTS } from '../services/ApiConstants';

const Profile = () => {
  const { user, logout, isAuthenticated, isFaculty } = useAuth();
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
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [feedbackStats, setFeedbackStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    inReview: 0
  });

  useEffect(() => {
    const isNotAuthenticated = !isAuthenticated;
    if (isNotAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchFeedbackStats();
  }, [isAuthenticated, navigate]);

  const fetchProfile = async () => {
    setFetching(true);
    setError('');
    try {
      const response = await HttpService.get(API_ENDPOINTS.GET_USER_PROFILE);

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
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      const errorMessage = error.message || 'Failed to load profile';
      setError(errorMessage);
    } finally {
      setFetching(false);
    }
  };

  const fetchFeedbackStats = async () => {
    try {
      const response = await HttpService.get(API_ENDPOINTS.GET_USER_FEEDBACK);
      const feedbacks = response || [];

      const stats = {
        total: feedbacks.length,
        resolved: 0,
        pending: 0,
        inReview: 0
      };

      for (let i = 0; i < feedbacks.length; i++) {
        const f = feedbacks[i];
        const status = f.status?.toUpperCase();
        if (status === 'RESOLVED') {
          stats.resolved = stats.resolved + 1;
        } else if (status === 'PENDING') {
          stats.pending = stats.pending + 1;
        } else if (status === 'IN_REVIEW') {
          stats.inReview = stats.inReview + 1;
        }
      }

      setFeedbackStats(stats);
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
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

      const hasNewPassword = formData.newPassword !== '';
      if (hasNewPassword) {
        const noCurrentPassword = !formData.currentPassword;
        if (noCurrentPassword) {
          setError('Please enter your current password to change password');
          setLoading(false);
          return;
        }

        const isPasswordTooShort = formData.newPassword.length < 6;
        if (isPasswordTooShort) {
          setError('New password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const passwordsDoNotMatch = formData.newPassword !== formData.confirmPassword;
        if (passwordsDoNotMatch) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }

        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await HttpService.put(API_ENDPOINTS.UPDATE_USER_PROFILE, updateData);

      const hasError = response.error;
      if (hasError) {
        setError(response.error);
        setLoading(false);
        return;
      }

      const updatedUser = {
        ...user,
        fullName: formData.fullName,
        department: formData.department
      };
      localStorage.setItem('userData', JSON.stringify(updatedUser));

      setSuccess('Profile updated successfully!');
      setEditing(false);
      await fetchProfile();

      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update profile';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      fullName: profile.fullName || '',
      department: profile.department || '',
      currentPassword: '',
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
    const roleLower = role?.toLowerCase();
    if (roleLower === 'admin') {
      return 'bg-purple-100 text-purple-800';
    }
    if (roleLower === 'faculty') {
      return 'bg-blue-100 text-blue-800';
    }
    if (roleLower === 'student') {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role) => {
    const roleLower = role?.toLowerCase();
    if (roleLower === 'admin') {
      return 'Crown';
    }
    if (roleLower === 'faculty') {
      return 'Teacher';
    }
    if (roleLower === 'student') {
      return 'Student';
    }
    return 'User';
  };

  const formatDate = (dateString) => {
    const hasNoDate = !dateString;
    if (hasNoDate) {
      return 'N/A';
    }
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.toLocaleString('en-US', { month: 'long' });
      const day = date.getDate();
      return month + ' ' + day + ', ' + year;
    } catch {
      return 'N/A';
    }
  };

  const getInitials = () => {
    const name = profile.fullName;
    if (!name) {
      return 'U';
    }
    return name.charAt(0).toUpperCase();
  };

  const getDepartmentDisplay = () => {
    const dept = profile.department;
    if (!dept || dept === 'Not specified') {
      return 'Not specified';
    }
    return dept;
  };

  const getUserIdDisplay = () => {
    const id = profile.userId;
    if (!id) {
      return 'N/A';
    }
    return '#' + id;
  };

  const getRoleDisplay = () => {
    const role = profile.role;
    if (!role) {
      return 'Student';
    }
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getButtonText = () => {
    if (loading) {
      return 'Saving...';
    }
    return 'Save Changes';
  };

  const isFetching = fetching;
  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const hasSuccess = success !== '';
  const hasError = error !== '';

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="theme-card overflow-hidden">
          <div className="theme-gradient-bg p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold backdrop-blur-sm">
                {getInitials()}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{profile.fullName || 'User'}</h1>
                <p className="text-white/90">{profile.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(profile.role)} bg-white/20 backdrop-blur-sm`}>
                    <span>{getRoleIcon(profile.role)}</span>
                    <span>{getRoleDisplay()}</span>
                  </span>
                  {(() => {
                    const hasDepartment = profile.department && profile.department !== 'Not specified';
                    if (hasDepartment) {
                      return (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
                          <span>Department</span>
                          <span>{profile.department}</span>
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {hasSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border-l-4 border-green-500">
                {success}
              </div>
            )}

            {hasError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border-l-4 border-red-500">
                {error}
              </div>
            )}

            {!editing ? (
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
                      {getRoleIcon(profile.role)} {getRoleDisplay()}
                    </p>
                  </div>
                  <div className="border-b pb-3">
                    <label className="block text-gray-500 text-sm mb-1">Department</label>
                    <p className="text-gray-800 font-medium">{getDepartmentDisplay()}</p>
                  </div>
                  <div className="border-b pb-3">
                    <label className="block text-gray-500 text-sm mb-1">Member Since</label>
                    <p className="text-gray-800 font-medium">{formatDate(profile.createdAt)}</p>
                  </div>
                  <div className="border-b pb-3">
                    <label className="block text-gray-500 text-sm mb-1">User ID</label>
                    <p className="text-gray-800 font-mono text-sm">{getUserIdDisplay()}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 theme-button rounded-lg transition flex items-center gap-2"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E9C] focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E9C]"
                    placeholder="Computer Science, Engineering, Business"
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    Change Password
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">Current Password</label>
                      <input
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E9C]"
                        placeholder="Enter your current password"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">New Password</label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E9C]"
                        placeholder="Enter new password (min. 6 characters)"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E9C]"
                        placeholder="Confirm your new password"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Leave password fields empty to keep current password</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="px-4 py-2 theme-button rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {getButtonText()}
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

        {(() => {
          const isNotFaculty = !isFaculty;
          if (isNotFaculty) {
            return (
              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  Account Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg hover:shadow-md transition">
                    <div className="text-3xl font-bold theme-text">{feedbackStats.total}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Feedback</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg hover:shadow-md transition">
                    <div className="text-3xl font-bold text-green-600">{feedbackStats.resolved}</div>
                    <div className="text-sm text-gray-600 mt-1">Resolved</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg hover:shadow-md transition">
                    <div className="text-3xl font-bold text-yellow-600">{feedbackStats.pending}</div>
                    <div className="text-sm text-gray-600 mt-1">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg hover:shadow-md transition">
                    <div className="text-3xl font-bold text-purple-600">{feedbackStats.inReview}</div>
                    <div className="text-sm text-gray-600 mt-1">In Review</div>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
};

export default Profile;