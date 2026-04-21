import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import HttpService from '../services/HttpService';

const AdminReports = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [allFeedback, setAllFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('reports');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchReports();
    fetchUsers();
    fetchAllFeedback();
  }, [isAdmin, navigate]);

  const fetchReports = async () => {
    try {
      const response = await HttpService.get('/admin/reports');
      setReports(response || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await HttpService.get('/admin/users');
      console.log('Fetched users:', response);
      setUsers(response || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setError('Failed to load users');
    }
  };

  const fetchAllFeedback = async () => {
    try {
      const response = await HttpService.get('/feedback');
      setAllFeedback(response || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setAllFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId, feedbackTitle) => {
    if (window.confirm(`Are you sure you want to delete "${feedbackTitle}"?`)) {
      setActionLoading(true);
      try {
        await HttpService.delete(`/admin/feedback/${feedbackId}`);
        setSuccess(`Feedback "${feedbackTitle}" deleted successfully`);
        fetchReports();
        fetchAllFeedback();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting feedback:', error);
        setError('Failed to delete feedback');
        setTimeout(() => setError(''), 3000);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleResolveReport = async (reportId) => {
    setActionLoading(true);
    try {
      await HttpService.put(`/admin/reports/${reportId}/resolve`, {});
      setSuccess('Report resolved successfully');
      fetchReports();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error resolving report:', error);
      setError('Failed to resolve report');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanUser = async (userId, userName, currentStatus) => {
    const action = currentStatus ? 'unban' : 'ban';
    if (window.confirm(`Are you sure you want to ${action} ${userName}?`)) {
      setActionLoading(true);
      try {
        await HttpService.put(`/admin/users/${userId}/ban`, { banned: !currentStatus });
        setSuccess(`${userName} has been ${action}ned successfully`);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error banning user:', error);
        setError(`Failed to ${action} user`);
        setTimeout(() => setError(''), 3000);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to permanently delete ${userName}? This action cannot be undone.`)) {
      setActionLoading(true);
      try {
        await HttpService.delete(`/admin/users/${userId}`);
        setSuccess(`${userName} has been deleted successfully`);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user');
        setTimeout(() => setError(''), 3000);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleUpdateRole = async (userId, newRole, userName) => {
    setActionLoading(true);
    try {
      await HttpService.put(`/admin/users/${userId}/role`, { role: newRole });
      setSuccess(`${userName}'s role updated to ${newRole}`);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating role:', error);
      setError('Failed to update role');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border-l-4 border-green-500">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border-l-4 border-red-500">
            ❌ {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setSelectedTab('reports')}
            className={`px-4 py-2 font-medium transition ${
              selectedTab === 'reports'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📋 Reports ({reports.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setSelectedTab('users')}
            className={`px-4 py-2 font-medium transition ${
              selectedTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            👥 User Management ({users.length})
          </button>
          <button
            onClick={() => setSelectedTab('feedback')}
            className={`px-4 py-2 font-medium transition ${
              selectedTab === 'feedback'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📝 All Feedback ({allFeedback.length})
          </button>
        </div>

        {/* Reports Tab */}
        {selectedTab === 'reports' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Reported Content</h2>
            {reports.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No reports to review</p>
              </div>
            ) : (
              reports.map(report => (
                <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">{report.feedbackTitle}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Reported by: {report.reportedBy} | {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-red-700">
                      <span className="font-semibold">Report Reason:</span> {report.reason}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDeleteFeedback(report.feedbackId, report.feedbackTitle)}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
                    >
                      Delete Feedback
                    </button>
                    <button
                      onClick={() => handleResolveReport(report.id)}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                    >
                      Dismiss Report
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users Tab - User Management */}
        {selectedTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              {users.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user.userId || user.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {(user.fullName || user.name || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{user.fullName || user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-gray-600">{user.department || '-'}</td>
                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.userId || user.id, e.target.value, user.fullName || user.name)}
                            disabled={actionLoading}
                            className="px-2 py-1 border rounded text-sm capitalize focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.banned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBanUser(user.userId || user.id, user.fullName || user.name, user.banned)}
                              disabled={actionLoading}
                              className={`px-2 py-1 rounded text-xs text-white transition ${
                                user.banned 
                                  ? 'bg-green-600 hover:bg-green-700' 
                                  : 'bg-yellow-600 hover:bg-yellow-700'
                              } disabled:opacity-50`}
                            >
                              {user.banned ? 'Unban' : 'Ban'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.userId || user.id, user.fullName || user.name)}
                              disabled={actionLoading}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* All Feedback Tab */}
        {selectedTab === 'feedback' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">All Feedback Submissions</h2>
            {allFeedback.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No feedback submissions yet</p>
              </div>
            ) : (
              allFeedback.map(feedback => (
                <div key={feedback.feedbackId || feedback.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{feedback.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{feedback.description}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{feedback.category}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(feedback.status)}`}>
                          {feedback.status || 'PENDING'}
                        </span>
                        <span className="text-xs text-gray-400">By: {feedback.authorEmail}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFeedback(feedback.feedbackId || feedback.id, feedback.title)}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm ml-4 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;