import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import HttpService from '../services/HttpService';

const ReportButton = ({ feedbackId, feedbackTitle }) => {
  const { isAdmin, isFaculty } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Don't render button for admins
  if (isAdmin) {
    return null;
  }

  // Only faculty can report
  if (!isFaculty) {
    return null;
  }

  const handleReport = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for reporting');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      await HttpService.post('/reports/create', {
        feedbackId: feedbackId,
        reason: reason
      });
      alert('Report submitted successfully. Admin will review it.');
      setShowModal(false);
      setReason('');
    } catch (error) {
      console.error('Error submitting report:', error);
      setError(error.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition text-sm flex items-center gap-1"
      >
        🚩 Report
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Report Inappropriate Content</h3>
            <p className="text-gray-600 text-sm mb-4">
              Reporting: <span className="font-medium">{feedbackTitle}</span>
            </p>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-2">Reason for reporting</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select a reason...</option>
                <option value="spam">Spam or misleading</option>
                <option value="harassment">Harassment or bullying</option>
                <option value="inappropriate">Inappropriate content</option>
                <option value="offensive">Offensive language</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-2">Additional details (optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Please provide more details..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportButton;