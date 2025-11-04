import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { 
  Calendar, 
  ArrowLeft,
  Download,
  Printer,
  RefreshCw,
  Eye,
  Filter,
  Share2,
  Star,
  Clock,
  User,
  Users,
  Building2,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart,
  Search,
  Grid3X3,
  List,
  ChevronDown,
  MessageCircle,
  Edit2
} from 'lucide-react';
import { 
  getTimetables, 
  getTimetable, 
  updateTimetableStatus,
  addTimetableComment 
} from '../services/api';

const ViewTimetable = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [viewType, setViewType] = useState('grid');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [timetables, setTimetables] = useState([]);
  const [currentTimetable, setCurrentTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '08:00-09:00', '09:00-10:00', '10:05-11:05', '11:05-11:15', 
    '11:15-12:15', '12:20-13:20', '13:20-14:20', '14:20-15:20',
    '15:25-16:25', '16:30-17:30'
  ];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (id) {
        // Load specific timetable
        const response = await getTimetable(id);
        setCurrentTimetable(response.data);
      } else {
        // Load all timetables
        const response = await getTimetables({ status: 'completed' });
        setTimetables(response.data);
      }
    } catch (error) {
      console.error('Error loading timetable data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (id) {
      navigate('/view-timetable');
    } else {
      navigate('/admin-dashboard');
    }
  };

  const handleStatusUpdate = async (timetableId, newStatus) => {
    try {
      await updateTimetableStatus(timetableId, newStatus);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating timetable status');
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !currentTimetable) return;

    try {
      await addTimetableComment(currentTimetable._id, comment);
      setComment('');
      setShowCommentModal(false);
      await loadData(); // Refresh to get updated comments
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment');
    }
  };

  const filteredSchedule = currentTimetable?.schedule?.filter(slot => {
    const matchesDay = selectedDay === 'all' || slot.day === selectedDay;
    const matchesSearch = !searchTerm || 
      slot.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.classroomName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDay && matchesSearch;
  }) || [];

  const getQualityColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper: download a file blob
  const downloadFile = (content, filename, mime = 'text/csv') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Export current timetable schedule as CSV
  const exportCurrentTimetableCSV = () => {
    if (!currentTimetable?.schedule) return;
    const rows = [];
    rows.push(['Day','StartTime','EndTime','CourseCode','CourseName','SessionType','Teacher','Classroom','StudentCount']);
    // Sort schedule by day and startTime for consistent ordering
    const order = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
    const sorted = [...currentTimetable.schedule].sort((a,b) => {
      if (order[a.day] !== order[b.day]) return order[a.day] - order[b.day];
      if (a.startTime === b.startTime) return a.endTime.localeCompare(b.endTime);
      return a.startTime.localeCompare(b.startTime);
    });

    for (const s of sorted) {
      rows.push([
        s.day || '',
        s.startTime || '',
        s.endTime || '',
        s.courseCode || s.courseId || '',
        s.courseName || '',
        s.sessionType || '',
        s.teacherName || '',
        s.classroomName || '',
        s.studentCount != null ? String(s.studentCount) : ''
      ]);
    }

    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
    const filename = `${currentTimetable.name || 'timetable'}.csv`;
    downloadFile(csv, filename, 'text/csv');
  };

  const exportCurrentTimetableJSON = () => {
    if (!currentTimetable) return;
    const json = JSON.stringify(currentTimetable, null, 2);
    const filename = `${currentTimetable.name || 'timetable'}.json`;
    downloadFile(json, filename, 'application/json');
  };

  const printTimetable = () => {
    if (!currentTimetable) return;
    // Open a new window and render a simple printable view
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    const doc = printWindow.document.open();
    const title = currentTimetable.name || 'Timetable';
    const scheduleHtml = (currentTimetable.schedule || []).map(s => `
      <tr>
        <td>${s.day || ''}</td>
        <td>${s.startTime || ''}</td>
        <td>${s.endTime || ''}</td>
        <td>${s.courseCode || s.courseId || ''}</td>
        <td>${s.courseName || ''}</td>
        <td>${s.sessionType || ''}</td>
        <td>${s.teacherName || ''}</td>
        <td>${s.classroomName || ''}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>body{font-family: Arial, Helvetica, sans-serif;}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}th{background:#f3f4f6;text-align:left}</style>
        </head>
        <body>
          <h2>${title}</h2>
          <table>
            <thead><tr><th>Day</th><th>Start</th><th>End</th><th>Code</th><th>Course</th><th>Type</th><th>Teacher</th><th>Room</th></tr></thead>
            <tbody>
              ${scheduleHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Give the window a moment to render then trigger print
    setTimeout(() => { printWindow.print(); }, 500);
  };

  // Export timetable by id (used from list view)
  const exportTimetableFromList = async (id, name = 'timetable') => {
    try {
      const response = await getTimetable(id, 'schedule_only');
      const timetable = response.data;
      if (!timetable || !timetable.schedule) {
        alert('No schedule available to export');
        return;
      }

      // Build CSV similar to exportCurrentTimetableCSV
      const rows = [];
      rows.push(['Day','StartTime','EndTime','CourseCode','CourseName','SessionType','Teacher','Classroom','StudentCount']);
      const order = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
      const sorted = [...timetable.schedule].sort((a,b) => {
        if (order[a.day] !== order[b.day]) return order[a.day] - order[b.day];
        if (a.startTime === b.startTime) return a.endTime.localeCompare(b.endTime);
        return a.startTime.localeCompare(b.startTime);
      });

      for (const s of sorted) {
        rows.push([
          s.day || '',
          s.startTime || '',
          s.endTime || '',
          s.courseCode || s.courseId || '',
          s.courseName || '',
          s.sessionType || '',
          s.teacherName || '',
          s.classroomName || '',
          s.studentCount != null ? String(s.studentCount) : ''
        ]);
      }

      const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
      const filename = `${name || 'timetable'}.csv`;
      downloadFile(csv, filename, 'text/csv');
    } catch (error) {
      console.error('Error exporting timetable:', error);
      alert('Error exporting timetable');
    }
  };

  const renderTimetableGrid = () => {
    if (!currentTimetable?.schedule) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Time</th>
                {daysOfWeek.map(day => (
                  <th key={day} className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {timeSlots.map(timeSlot => (
                <tr key={timeSlot} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {timeSlot}
                  </td>
                  {daysOfWeek.map(day => {
                    const session = currentTimetable.schedule.find(s => 
                      s.day === day && s.startTime + '-' + s.endTime === timeSlot
                    );
                    
                    return (
                      <td key={`${day}-${timeSlot}`} className="px-4 py-4">
                        {session ? (
                          <div className="space-y-1">
                            <div className={`p-3 rounded-lg border-l-4 ${
                              session.sessionType === 'Theory' ? 'bg-blue-50 border-blue-400 dark:bg-blue-900/20' :
                              session.sessionType === 'Practical' ? 'bg-green-50 border-green-400 dark:bg-green-900/20' :
                              'bg-purple-50 border-purple-400 dark:bg-purple-900/20'
                            }`}>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {session.courseName}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {session.courseCode} - {session.sessionType}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                👨‍🏫 {session.teacherName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                🏫 {session.classroomName}
                              </p>
                              {session.studentCount && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  👥 {session.studentCount} students
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="h-16 flex items-center justify-center text-gray-400">
                            <span className="text-xs">Free</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTimetableList = () => {
    return (
      <div className="space-y-4">
        {filteredSchedule.map((session, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    session.sessionType === 'Theory' ? 'bg-blue-100 text-blue-800' :
                    session.sessionType === 'Practical' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {session.sessionType}
                  </span>
                  <span className="text-sm font-medium text-gray-500">{session.day}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {session.courseName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {session.courseCode}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{session.startTime} - {session.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{session.teacherName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4" />
                    <span>{session.classroomName}</span>
                  </div>
                </div>
              </div>
              {session.studentCount && (
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{session.studentCount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTimetablesList = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {timetables.map((timetable) => (
            <div key={timetable._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {timetable.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {timetable.department} • Year {timetable.year} • Semester {timetable.semester}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${getStatusColor(timetable.status)}`}>
                  {timetable.status}
                </span>
              </div>

              {timetable.quality && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Quality Score</span>
                    <span className={`font-semibold ${getQualityColor(timetable.quality.overallScore)}`}>
                      {Math.round(timetable.quality.overallScore)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${timetable.quality.overallScore}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Classes:</span>
                  <span className="ml-1 font-medium">{timetable.statistics?.totalClasses || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Conflicts:</span>
                  <span className="ml-1 font-medium">{timetable.conflicts?.length || 0}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`/view-timetable/${timetable._id}`)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                
                {timetable.status === 'completed' && (
                  <button
                    onClick={() => handleStatusUpdate(timetable._id, 'published')}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Publish</span>
                  </button>
                )}
                
                <button
                  onClick={() => exportTimetableFromList(timetable._id, timetable.name)}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentTimetable ? currentTimetable.name : 'View Timetables'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-gray-500 dark:text-gray-400">Welcome, {user?.name}</span>
              <button 
                onClick={() => { logout(); navigate('/login'); }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {id ? 'Back to Timetables' : 'Back to Dashboard'}
          </button>
        </div>

        {currentTimetable ? (
          // Individual Timetable View
          <>
            {/* Timetable Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentTimetable.name}
                  </h2>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Academic Year: {currentTimetable.academicYear}</p>
                    <p>Department: {currentTimetable.department}</p>
                    <p>Semester: {currentTimetable.semester} • Year: {currentTimetable.year}</p>
                    <p>Generated: {new Date(currentTimetable.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded ${getStatusColor(currentTimetable.status)}`}>
                    {currentTimetable.status}
                  </span>
                  {currentTimetable.quality && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Quality Score</p>
                      <p className={`text-lg font-bold ${getQualityColor(currentTimetable.quality.overallScore)}`}>
                        {Math.round(currentTimetable.quality.overallScore)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewType('grid')}
                      className={`p-2 rounded ${viewType === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewType('list')}
                      className={`p-2 rounded ${viewType === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="all">All Days</option>
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Search courses, teachers, rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm w-64"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowCommentModal(true)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Comment</span>
                  </button>
                  <div className="relative">
                    <button
                      onClick={exportCurrentTimetableCSV}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                  <button onClick={exportCurrentTimetableJSON} className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                    <BookOpen className="w-4 h-4" />
                    <span>Export JSON</span>
                  </button>
                  <button onClick={printTimetable} className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Timetable Display */}
            {viewType === 'grid' ? renderTimetableGrid() : renderTimetableList()}

            {/* Statistics */}
            {currentTimetable.statistics && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{currentTimetable.statistics.totalClasses}</p>
                    <p className="text-sm text-gray-500">Total Classes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{currentTimetable.statistics.totalTeachers}</p>
                    <p className="text-sm text-gray-500">Teachers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{currentTimetable.statistics.totalRooms}</p>
                    <p className="text-sm text-gray-500">Rooms Used</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{currentTimetable.conflicts?.length || 0}</p>
                    <p className="text-sm text-gray-500">Conflicts</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // Timetables List View
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Generated Timetables</h2>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage all generated timetables
              </p>
            </div>

            {timetables.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Timetables Found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven't generated any timetables yet.
                </p>
                <button
                  onClick={() => navigate('/generate-timetable')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Generate First Timetable
                </button>
              </div>
            ) : (
              renderTimetablesList()
            )}
          </>
        )}
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Comment</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comment..."
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                disabled={!comment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTimetable;