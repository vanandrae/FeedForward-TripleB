import React, { useState } from 'react';

const ViewFeedback = () => {
  const [filter, setFilter] = useState('all');
  const [feedbackList] = useState([]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">All Feedback</h1>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
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

        {/* Empty State */}
        {feedbackList.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No feedback submissions yet</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">Submit Feedback</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewFeedback;