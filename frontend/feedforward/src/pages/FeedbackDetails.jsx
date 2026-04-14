import React, { useState } from 'react';

const FeedbackDetails = () => {
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('pending');

  // Sample feedback details
  const feedback = {
    id: 1,
    title: "Add dark mode support",
    description: "It would be great to have a dark mode option for better night time usage...",
    category: "feature",
    status: "pending",
    priority: "medium",
    createdAt: "2024-01-15",
    author: "John Doe",
    votes: 23,
    comments: [
      { id: 1, user: "Admin", comment: "Thanks for the suggestion! We'll consider this.", date: "2024-01-16" }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2">
          ← Back to all feedback
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">{feedback.title}</h1>
                <div className="flex gap-3 text-sm">
                  <span>📅 {feedback.createdAt}</span>
                  <span>👤 {feedback.author}</span>
                  <span>🏷️ {feedback.category}</span>
                </div>
              </div>
              
              {/* Status Badge */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white border border-white/30"
              >
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{feedback.description}</p>
            </div>

            {/* Voting */}
            <div className="mb-6 flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                👍 {feedback.votes} Upvote
              </button>
              <span className="text-gray-500">Priority: {feedback.priority}</span>
            </div>

            {/* Comments Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Comments ({feedback.comments.length})
              </h3>
              
              {/* Comments List */}
              <div className="space-y-4 mb-6">
                {feedback.comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{comment.user}</span>
                      <span className="text-sm text-gray-500">{comment.date}</span>
                    </div>
                    <p className="text-gray-700">{comment.comment}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Add a comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your thoughts..."
                />
                <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetails;