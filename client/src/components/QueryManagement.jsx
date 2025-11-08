import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  getQueries, 
  updateQueryStatus, 
  respondToQuery, 
  deleteQuery,
  addQueryComment,
  getQueryStatistics 
} from '../services/api';
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  Trash2,
  Eye,
  Filter,
  Search,
  TrendingUp,
  User,
  Calendar,
  MessageCircle,
  X
} from 'lucide-react';

const QueryManagement = () => {
  const { isDarkMode } = useTheme();
  const [queries, setQueries] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [response, setResponse] = useState('');
  const [comment, setComment] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all'
  });

  useEffect(() => {
    fetchQueries();
    fetchStatistics();
  }, [filters]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.priority !== 'all') params.priority = filters.priority;

      const result = await getQueries(params);
      setQueries(result.data || []);
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const result = await getQueryStatistics();
      setStatistics(result.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleStatusUpdate = async (queryId, newStatus) => {
    try {
      await updateQueryStatus(queryId, newStatus);
      fetchQueries();
      fetchStatistics();
      if (selectedQuery && selectedQuery._id === queryId) {
        setSelectedQuery({ ...selectedQuery, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleSendResponse = async () => {
    if (!response.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      await respondToQuery(selectedQuery._id, response);
      setResponse('');
      setShowResponseModal(false);
      fetchQueries();
      fetchStatistics();
      setSelectedQuery(null);
      alert('Response sent successfully!');
    } catch (error) {
      console.error('Error sending response:', error);
      alert('Failed to send response');
    }
  };

  const handleAddComment = async (queryId) => {
    if (!comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      await addQueryComment(queryId, comment);
      setComment('');
      fetchQueries();
      alert('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleDeleteQuery = async (queryId) => {
    if (window.confirm('Are you sure you want to delete this query?')) {
      try {
        await deleteQuery(queryId);
        fetchQueries();
        fetchStatistics();
        setSelectedQuery(null);
        alert('Query deleted successfully!');
      } catch (error) {
        console.error('Error deleting query:', error);
        alert('Failed to delete query');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'resolved': return 'blue';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const StatusBadge = ({ status }) => {
    const color = getStatusColor(status);
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 dark:bg-${color}-900/30 dark:text-${color}-400`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const PriorityBadge = ({ priority }) => {
    const color = getPriorityColor(priority);
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium bg-${color}-100 text-${color}-800 dark:bg-${color}-900/30 dark:text-${color}-400`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{statistics.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{statistics.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Approved</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{statistics.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rejected</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{statistics.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Resolved</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{statistics.resolved}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="all">All Types</option>
              <option value="timetable-conflict">Timetable Conflict</option>
              <option value="schedule-change">Schedule Change</option>
              <option value="general">General</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queries List */}
      <div className="space-y-4">
        {loading ? (
          <div className={`p-8 text-center rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading queries...</p>
          </div>
        ) : queries.length === 0 ? (
          <div className={`p-8 text-center rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No queries found</p>
          </div>
        ) : (
          queries.map((query) => (
            <div
              key={query._id}
              className={`p-5 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {query.subject}
                    </h3>
                    <StatusBadge status={query.status} />
                    <PriorityBadge priority={query.priority} />
                  </div>
                  <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {query.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs">
                    <span className={`flex items-center space-x-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <User className="w-3 h-3" />
                      <span>{query.submittedBy?.name || 'Unknown'} ({query.submittedBy?.role || 'N/A'})</span>
                    </span>
                    <span className={`flex items-center space-x-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(query.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className={`flex items-center space-x-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <MessageCircle className="w-3 h-3" />
                      <span>Type: {query.type}</span>
                    </span>
                    {query.timetableId && (
                      <span className={`flex items-center space-x-1 px-2 py-1 rounded ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                        <Calendar className="w-3 h-3" />
                        <span>Has Timetable</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {query.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(query._id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(query._id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => {
                    setSelectedQuery(query);
                    setShowResponseModal(true);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    isDarkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Respond</span>
                </button>

                {query.status !== 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(query._id, 'pending')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      isDarkMode 
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Mark Pending</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedQuery(query)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => handleDeleteQuery(query._id)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    isDarkMode 
                      ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>

              {/* Admin Response if exists */}
              {query.adminResponse && (
                <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700/50' : 'bg-blue-50 border border-blue-200'}`}>
                  <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Admin Response:
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {query.adminResponse}
                  </p>
                  {query.respondedBy && (
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Responded by {query.respondedBy.name} on {new Date(query.respondedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full rounded-xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Respond to Query
              </h3>
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setResponse('');
                }}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className={`font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedQuery.subject}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedQuery.description}
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your Response
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={6}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter your response here..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setResponse('');
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendResponse}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Response</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Query Details Modal */}
      {selectedQuery && !showResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-3xl w-full rounded-xl p-6 max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Query Details
              </h3>
              <button
                onClick={() => setSelectedQuery(null)}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Subject</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {selectedQuery.subject}
                </p>
              </div>

              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Description</p>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedQuery.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
                  <StatusBadge status={selectedQuery.status} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Priority</p>
                  <PriorityBadge priority={selectedQuery.priority} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Type</p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedQuery.type}
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Submitted</p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {new Date(selectedQuery.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Submitted By</p>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedQuery.submittedBy?.name} ({selectedQuery.submittedBy?.email})
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Role: {selectedQuery.submittedBy?.role}
                </p>
              </div>

              {/* Timetable Information */}
              {selectedQuery.timetableId && (
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20 border border-purple-700/50' : 'bg-purple-50 border border-purple-200'}`}>
                  <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    Related Timetable:
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedQuery.timetableId?.name || 'Timetable'} 
                    {selectedQuery.timetableId?.academicYear && ` - ${selectedQuery.timetableId.academicYear}`}
                    {selectedQuery.timetableId?.semester && ` - ${selectedQuery.timetableId.semester}`}
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    Timetable ID: {typeof selectedQuery.timetableId === 'string' ? selectedQuery.timetableId : selectedQuery.timetableId?._id}
                  </p>
                </div>
              )}

              {selectedQuery.adminResponse && (
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700/50' : 'bg-blue-50 border border-blue-200'}`}>
                  <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Admin Response:
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedQuery.adminResponse}
                  </p>
                </div>
              )}

              {/* Comments Section */}
              {selectedQuery.comments && selectedQuery.comments.length > 0 && (
                <div>
                  <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Comments ({selectedQuery.comments.length})
                  </p>
                  <div className="space-y-2">
                    {selectedQuery.comments.map((comment, index) => (
                      <div key={index} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {comment.text}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          - {comment.commentedBy?.name} on {new Date(comment.commentedAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryManagement;
