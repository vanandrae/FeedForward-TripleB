import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import HttpService from '../services/HttpService';
import { API_ENDPOINTS } from '../services/ApiConstants';

const Reports = () => {
  const { isAdmin, isFaculty } = useAuth(); // Removed unused 'user'
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('feedback');
  const [dateRange, setDateRange] = useState('monthly');
  const [format, setFormat] = useState('csv');
  const [stats, setStats] = useState({
    totalFeedback: 0,
    resolved: 0,
    pending: 0,
    inReview: 0,
    avgResolutionTime: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await HttpService.get(API_ENDPOINTS.GET_DASHBOARD_STATS);
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await HttpService.post('/reports/generate', {
        type: reportType,
        dateRange: dateRange,
        format: format
      });
      
      if (format === 'csv') {
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${reportType}_${new Date().toISOString()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      alert('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin && !isFaculty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-gray-600 mt-2">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Reports & Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500 text-sm">Total Feedback</div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalFeedback}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500 text-sm">Resolved</div>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500 text-sm">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500 text-sm">In Review</div>
            <div className="text-2xl font-bold text-purple-600">{stats.inReview}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500 text-sm">Avg Resolution</div>
            <div className="text-2xl font-bold text-orange-600">{stats.avgResolutionTime || 0} hrs</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Generate Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Report Type</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="feedback">Feedback Summary</option>
                <option value="users">User Activity</option>
                <option value="department">Department Report</option>
                <option value="resolution">Resolution Time</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Date Range</label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last 30 Days</option>
                <option value="quarterly">Last 90 Days</option>
                <option value="yearly">Last Year</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Export Format</label>
              <select 
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateReport}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;