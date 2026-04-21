import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import HttpService from '../services/HttpService';
import { API_ENDPOINTS } from '../services/ApiConstants';

const Reports = () => {
  const { isAdmin, isFaculty, isAuthenticated } = useAuth();
  const navigate = useNavigate();
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
  const [feedbackData, setFeedbackData] = useState([]);
  const [generatedReport, setGeneratedReport] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin && !isFaculty) {
      navigate('/dashboard');
      return;
    }
    fetchStats();
    fetchFeedbackData();
  }, [isAuthenticated, isAdmin, isFaculty, navigate]);

  const fetchStats = async () => {
    try {
      const response = await HttpService.get(API_ENDPOINTS.GET_DASHBOARD_STATS);
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFeedbackData = async () => {
    try {
      const response = await HttpService.get(API_ENDPOINTS.GET_ALL_FEEDBACK);
      setFeedbackData(response || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const generateCSV = () => {
    let data = [];
    
    switch(reportType) {
      case 'feedback':
        data = feedbackData.map(f => ({
          'ID': f.feedbackId || f.id,
          'Title': f.title,
          'Description': f.description,
          'Category': f.category,
          'Status': f.status,
          'Priority': f.priority,
          'Author': f.authorEmail,
          'Created Date': new Date(f.createdAt).toLocaleDateString(),
          'Votes': f.votes || 0
        }));
        break;
      case 'users':
        // This would need a users endpoint
        data = [{ message: 'User report - feature coming soon' }];
        break;
      case 'department':
        data = feedbackData.reduce((acc, f) => {
          const dept = f.department || 'Unknown';
          const existing = acc.find(item => item.Department === dept);
          if (existing) {
            existing.Count++;
          } else {
            acc.push({ Department: dept, Count: 1 });
          }
          return acc;
        }, []);
        break;
      case 'resolution':
        const resolved = feedbackData.filter(f => f.status?.toLowerCase() === 'resolved');
        data = resolved.map(f => ({
          'Title': f.title,
          'Resolved Date': new Date(f.updatedAt || f.createdAt).toLocaleDateString(),
          'Time to Resolve': 'N/A'
        }));
        break;
      default:
        data = feedbackData;
    }
    
    if (data.length === 0) {
      alert('No data available for the selected report type');
      return;
    }
    
    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    setGeneratedReport(csvContent);
    alert('Report generated and downloaded successfully!');
  };

  const generatePDF = () => {
    // For PDF, we'll create an HTML report that can be printed
    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>FeedForward Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #1976D2; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #1976D2; color: white; }
          .stats { display: flex; gap: 20px; margin: 20px 0; }
          .stat-card { background: #f5f5f5; padding: 15px; border-radius: 8px; flex: 1; }
          .stat-number { font-size: 24px; font-weight: bold; color: #1976D2; }
        </style>
      </head>
      <body>
        <h1>FeedForward Report - ${reportType.toUpperCase()}</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        
        <div class="stats">
          <div class="stat-card">
            <div>Total Feedback</div>
            <div class="stat-number">${stats.totalFeedback}</div>
          </div>
          <div class="stat-card">
            <div>Resolved</div>
            <div class="stat-number">${stats.resolved}</div>
          </div>
          <div class="stat-card">
            <div>Pending</div>
            <div class="stat-number">${stats.pending}</div>
          </div>
          <div class="stat-card">
            <div>In Review</div>
            <div class="stat-number">${stats.inReview}</div>
          </div>
        </div>
        
        <h2>Report Data</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Author</th>
              <th>Date</th>
             </tr>
          </thead>
          <tbody>
            ${feedbackData.slice(0, 50).map(f => `
              <tr>
                <td>${f.feedbackId || f.id}</td>
                <td>${f.title}</td>
                <td>${f.category}</td>
                <td>${f.status}</td>
                <td>${f.authorEmail}</td>
                <td>${new Date(f.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="margin-top: 20px; color: #666;">* This is a preview. For full data, use CSV export.</p>
      </body>
      </html>
    `;
    
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('Report generated and downloaded as HTML! You can print it as PDF.');
  };

  const handleGenerateReport = () => {
    setLoading(true);
    try {
      if (format === 'csv') {
        generateCSV();
      } else if (format === 'pdf') {
        generatePDF();
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin && !isFaculty) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Reports & Analytics</h1>

        {/* Stats Overview */}
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
            <div className="text-gray-500 text-sm">Resolution Rate</div>
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalFeedback > 0 ? Math.round((stats.resolved / stats.totalFeedback) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Report Generator */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Generate Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Report Type</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="feedback">Feedback Summary</option>
                <option value="users">User Activity</option>
                <option value="department">Department Report</option>
                <option value="resolution">Resolution Time</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Export Format</label>
              <select 
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="csv">CSV (Excel Compatible)</option>
                <option value="pdf">HTML Report (Printable)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate & Download Report'}
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
            <strong>📊 Report Info:</strong> {reportType === 'feedback' && 'Generates a CSV with all feedback submissions including title, description, status, author, and votes.'}
            {reportType === 'users' && 'User activity report - coming soon with user data.'}
            {reportType === 'department' && 'Groups feedback by department to see which departments are most active.'}
            {reportType === 'resolution' && 'Shows resolved feedback and resolution times.'}
          </div>
        </div>

        {/* Recent Feedback Preview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Feedback Preview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Author</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {feedbackData.slice(0, 10).map(feedback => (
                  <tr key={feedback.feedbackId || feedback.id} className="border-t">
                    <td className="px-4 py-2">{feedback.title}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        feedback.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                        feedback.status === 'IN_REVIEW' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {feedback.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-2">{feedback.authorEmail}</td>
                    <td className="px-4 py-2">{new Date(feedback.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {feedbackData.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">No feedback data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;