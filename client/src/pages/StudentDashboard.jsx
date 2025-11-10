import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Chatbot from '../components/Chatbot';
import AdminSidebar from '../components/AdminSidebar';
import { getTimetables, getQueries, createQuery, getPublishedTimetables } from '../services/api';
import { 
  Calendar, 
  BookOpen, 
  Clock, 
  MapPin, 
  User, 
  LogOut, 
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Plus,
  Sun,
  Moon,
  Loader,
  MessageSquare,
  BarChart3,
  PieChart,
  Activity,
  Award,
  X,
  Send
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('timetable');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timetableData, setTimetableData] = useState(null);
  const [allTimetables, setAllTimetables] = useState([]);
  const [queries, setQueries] = useState([]);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [newQuery, setNewQuery] = useState({
    subject: '',
    description: '',
    type: 'timetable-conflict',
    priority: 'medium',
    timetableId: ''
  });

  useEffect(() => {
    fetchStudentTimetable();
    if (activeTab === 'queries') {
      fetchQueries();
    }
  }, [activeTab]);

  const fetchStudentTimetable = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch the most recently published timetable (final timetable)
      const response = await getPublishedTimetables();
      const timetable = response.data; // Now it's a single object, not an array
      
      if (timetable) {
        setTimetableData(timetable);
        setAllTimetables([timetable]); // Wrap in array for compatibility
      } else {
        setTimetableData(null);
        setAllTimetables([]);
      }
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setError('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchQueries = async () => {
    try {
      const response = await getQueries();
      setQueries(response.data || []);
    } catch (err) {
      console.error('Error fetching queries:', err);
    }
  };

  const handleCreateQuery = async () => {
    if (!newQuery.subject.trim() || !newQuery.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const queryData = {
        subject: newQuery.subject,
        description: newQuery.description,
        type: newQuery.type,
        priority: newQuery.priority
      };
      
      // Add timetableId only if selected
      if (newQuery.timetableId) {
        queryData.timetableId = newQuery.timetableId;
      }

      await createQuery(queryData);
      setShowQueryModal(false);
      setNewQuery({
        subject: '',
        description: '',
        type: 'timetable-conflict',
        priority: 'medium',
        timetableId: ''
      });
      fetchQueries();
      alert('Query submitted successfully! Admin will review it shortly.');
    } catch (err) {
      console.error('Error creating query:', err);
      alert('Failed to submit query. Please try again.');
    }
  };

  // Empty arrays for now - would come from API in real system
  const currentWeek = [];
  const courses = [];
  const notifications = [];

  // Generate week view from timetable data
  const getWeekSchedule = () => {
    if (!timetableData || !timetableData.schedule) return [];
    
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek.map(day => {
      const dayClasses = timetableData.schedule
        .filter(slot => slot.day === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .map(slot => ({
          time: `${slot.startTime} - ${slot.endTime}`,
          subject: slot.courseName,
          teacher: slot.teacherName,
          room: slot.classroomName,
          type: slot.sessionType
        }));
      
      return {
        day,
        date: new Date().getDate(), // Simplified - should calculate actual dates
        classes: dayClasses
      };
    });
  };

  const weekSchedule = getWeekSchedule();

  const downloadTimetable = () => {
    if (!timetableData || !timetableData.schedule) {
      alert('No timetable available to download');
      return;
    }

    // Create CSV content
    const rows = [];
    rows.push(['Day', 'Time', 'Course', 'Teacher', 'Room', 'Type']);
    
    timetableData.schedule
      .sort((a, b) => {
        const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
        if (dayOrder[a.day] !== dayOrder[b.day]) return dayOrder[a.day] - dayOrder[b.day];
        return a.startTime.localeCompare(b.startTime);
      })
      .forEach(slot => {
        rows.push([
          slot.day,
          `${slot.startTime} - ${slot.endTime}`,
          slot.courseName,
          slot.teacherName,
          slot.classroomName,
          slot.sessionType
        ]);
      });

    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${timetableData.name || 'timetable'}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const renderTimetable = () => (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>This Week's Schedule</h3>
        <div className="flex items-center space-x-2">
          <button className={`p-2 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Week</span>
          <button className={`p-2 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin mr-3" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading timetable...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && weekSchedule.length === 0 && (
        <div className="text-center py-12">
          <Calendar className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            No Timetable Available
          </h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Your class schedule will appear here once it's published by the administration.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 text-red-500`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Error Loading Timetable
          </h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>{error}</p>
          <button 
            onClick={fetchStudentTimetable}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Timetable Info Banner */}
      {!loading && timetableData && (
        <div className={`rounded-xl border p-4 mb-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                {timetableData.name}
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                {timetableData.department} • Semester {timetableData.semester} • Year {timetableData.year}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Published</p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                {timetableData.publishedAt ? new Date(timetableData.publishedAt).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Grid */}
      {!loading && !error && weekSchedule.length > 0 && (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {weekSchedule.map((day, index) => (
          <div key={index} className={`rounded-xl border p-4 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="text-center mb-4">
              <h4 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{day.day}</h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>March {day.date}</p>
            </div>
            
            <div className="space-y-3">
              {day.classes.map((classItem, classIndex) => (
                <div key={classIndex} className={`p-3 rounded-lg border transition-colors duration-300 ${
                  classItem.type === 'Theory' 
                    ? (isDarkMode ? 'bg-blue-900/30 border-blue-700/50' : 'bg-blue-50 border-blue-200')
                    : classItem.type === 'Practical'
                    ? (isDarkMode ? 'bg-green-900/30 border-green-700/50' : 'bg-green-50 border-green-200')
                    : (isDarkMode ? 'bg-purple-900/30 border-purple-700/50' : 'bg-purple-50 border-purple-200')
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${
                      classItem.type === 'Theory' 
                        ? (isDarkMode ? 'text-blue-300' : 'text-blue-700')
                        : classItem.type === 'Practical'
                        ? (isDarkMode ? 'text-green-300' : 'text-green-700')
                        : (isDarkMode ? 'text-purple-300' : 'text-purple-700')
                    }`}>{classItem.time}</span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{classItem.room}</span>
                  </div>
                  <h5 className={`font-medium text-sm mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{classItem.subject}</h5>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{classItem.teacher}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                    classItem.type === 'Theory' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                      : classItem.type === 'Practical'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                  }`}>
                    {classItem.type}
                  </span>
                </div>
              ))}
              
              {day.classes.length === 0 && (
                <div className={`text-center py-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <p className="text-sm">No classes</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={downloadTimetable}
          disabled={!timetableData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>Download Timetable</span>
        </button>
        <button 
          onClick={() => navigate(`/view-timetable/${timetableData?._id}`)}
          disabled={!timetableData}
          className={`px-4 py-2 border rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <Eye className="w-4 h-4" />
          <span>View Full Schedule</span>
        </button>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>My Courses</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            No Courses Enrolled
          </h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            You haven't enrolled in any courses yet. Contact your administrator for course registration.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
          <div key={course.id} className={`rounded-xl border p-6 hover:shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.grade === 'A' || course.grade === 'A-' ? 
                  (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800') :
                course.grade === 'B+' || course.grade === 'B' ? 
                  (isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800') :
                  (isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800')
              }`}>
                {course.grade}
              </span>
            </div>
            
            <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{course.name}</h4>
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{course.code} • {course.credits} credits</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progress</span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{course.progress}%</span>
              </div>
              <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>My Queries</h3>
        <button 
          onClick={() => setShowQueryModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Raise Query</span>
        </button>
      </div>
      
      {queries.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            No Active Queries
          </h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Have a question? Click "Raise Query" to ask your instructors!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {queries.map((query) => (
            <div key={query._id} className={`rounded-xl border p-5 hover:shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-400'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-lg ${
                    query.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    query.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30' :
                    query.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    <MessageSquare className={`w-5 h-5 ${
                      query.status === 'pending' ? 'text-yellow-600' :
                      query.status === 'approved' ? 'text-green-600' :
                      query.status === 'rejected' ? 'text-red-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{query.subject}</h4>
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{query.description}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Submitted on {new Date(query.createdAt).toLocaleDateString()}
                    </p>
                    {query.adminResponse && (
                      <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                        <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                          Admin Response:
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {query.adminResponse}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  query.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  query.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  query.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {query.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Academic Analytics</h3>
        <button className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} shadow-lg hover:shadow-xl hover:scale-105`}>
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>
      
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className={`rounded-xl border p-6 transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-700/50' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-700/50' : 'bg-blue-200'}`}>
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h4 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Overall GPA</h4>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>3.7/4.0</p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>+0.2 from last semester</p>
        </div>

        <div className={`rounded-xl border p-6 transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-700/50' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-700/50' : 'bg-green-200'}`}>
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h4 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Attendance Rate</h4>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>95%</p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Excellent attendance!</p>
        </div>

        <div className={`rounded-xl border p-6 transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/50' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-700/50' : 'bg-purple-200'}`}>
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h4 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Courses Completed</h4>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>12/15</p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>80% completion rate</p>
        </div>
      </div>

      {/* Course Progress */}
      <div className={`rounded-xl border p-6 transition-all duration-300 hover:shadow-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-6">
          <h4 className={`text-lg font-semibold flex items-center space-x-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            <PieChart className="w-5 h-5 text-blue-600" />
            <span>Course Progress</span>
          </h4>
          <button className={`text-sm flex items-center space-x-1 transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
            <span>View Details</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          {[
            { name: 'Data Structures', progress: 85, grade: 'A', color: 'blue' },
            { name: 'Algorithms', progress: 78, grade: 'B+', color: 'green' },
            { name: 'Database Systems', progress: 92, grade: 'A', color: 'purple' },
            { name: 'Web Development', progress: 88, grade: 'A-', color: 'orange' }
          ].map((course, index) => (
            <div key={index} className={`p-4 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <BookOpen className={`w-5 h-5 text-${course.color}-600`} />
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{course.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    course.grade.startsWith('A') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {course.grade}
                  </span>
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{course.progress}%</span>
                </div>
              </div>
              <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <div 
                  className={`bg-${course.color}-600 h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Activity */}
      <div className={`rounded-xl border p-6 transition-all duration-300 hover:shadow-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h4 className={`text-lg font-semibold mb-5 flex items-center space-x-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          <Activity className="w-5 h-5 text-purple-600" />
          <span>Recent Study Activity</span>
        </h4>
        <div className="space-y-3">
          {[
            { action: 'Completed assignment', course: 'Data Structures', time: '2 hours ago', icon: CheckCircle, color: 'green' },
            { action: 'Attended lecture', course: 'Algorithms', time: '5 hours ago', icon: BookOpen, color: 'blue' },
            { action: 'Submitted project', course: 'Database Systems', time: '1 day ago', icon: Upload, color: 'purple' },
            { action: 'Took quiz', course: 'Web Development', time: '2 days ago', icon: Award, color: 'orange' }
          ].map((activity, index) => (
            <div key={index} className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
              <div className={`p-2 rounded-lg bg-${activity.color}-100 dark:bg-${activity.color}-900/30`}>
                <activity.icon className={`w-4 h-4 text-${activity.color}-600`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{activity.action}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{activity.course}</p>
              </div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Recent Notifications</h3>
      
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            No Notifications
          </h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            You're all up to date! New notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
          <div key={notification.id} className={`rounded-xl border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                notification.type === 'warning' ? 'bg-yellow-500' :
                notification.type === 'success' ? 'bg-green-500' :
                'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className={`text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{notification.message}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{notification.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Enhanced Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-800/95 border-gray-700 shadow-lg shadow-gray-900/50' : 'bg-white/95 border-gray-200 shadow-sm'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            {/* Left Section - Logo & Title */}
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Student Portal
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Academic Year 2024-25
                </p>
              </div>
            </div>
            
            {/* Right Section - Actions & Profile */}
            <div className="flex items-center space-x-2 ml-auto">
              {/* Quick Search */}
              <button 
                className={`hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Search...</span>
              </button>

              {/* Notifications */}
              <div className="relative">
                <button 
                  className={`p-2.5 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Divider */}
              <div className={`h-8 w-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
              
              {/* User Profile */}
              <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} cursor-pointer`}>
                <div className="relative">
                  <img 
                    src={user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'Student')} 
                    alt={user?.name}
                    className="w-9 h-9 rounded-full border-2 border-blue-500 shadow-md"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                <div className="hidden lg:block">
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {user?.name || 'Test Student'}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Student ID: {user?.studentId || 'STU2024001'}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <button 
                onClick={handleLogout}
                className={`p-2.5 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-red-900/30 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-600 hover:text-red-600'}`}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-0 pt-6 pb-8">
        <div className="w-full flex">
          <AdminSidebar 
            showQuickActions={false} 
            userRole="student" 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <main className="flex-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{ maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto', overflowX: 'hidden' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-0">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 animate-gradient rounded-xl p-3 mb-6 text-white shadow-2xl border border-white/10 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl shadow-lg backdrop-blur-sm">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome back, {user?.name}! 👋</h2>
              <p className="text-blue-100 text-sm">Here's your academic overview for this week</p>
            </div>
          </div>
        </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className={`rounded-xl p-4 border transition-all duration-300 hover:scale-105 hover:shadow-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Courses</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>5</p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-4 border transition-all duration-300 hover:scale-105 hover:shadow-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Classes Today</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>3</p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-4 border transition-all duration-300 hover:scale-105 hover:shadow-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Assignments Due</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>2</p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-4 border transition-all duration-300 hover:scale-105 hover:shadow-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>GPA</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>3.7</p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

      {/* Navigation Tabs */}
      <div className={`flex space-x-1 rounded-lg p-1 border mb-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {[
            { id: 'timetable', label: 'Timetable', icon: Calendar },
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'queries', label: 'Queries', icon: MessageSquare },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'notifications', label: 'Notifications', icon: Bell }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-all duration-300 text-sm ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

              {/* Content */}
              {activeTab === 'timetable' && renderTimetable()}
              {activeTab === 'courses' && renderCourses()}
              {activeTab === 'queries' && renderAssignments()}
              {activeTab === 'analytics' && renderAnalytics()}
              {activeTab === 'notifications' && renderNotifications()}
            </div>
          </main>
        </div>
      </div>

      {/* Query Creation Modal */}
      {showQueryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Raise a Query About Timetable
              </h3>
              <button
                onClick={() => {
                  setShowQueryModal(false);
                  setNewQuery({ subject: '', description: '', type: 'timetable-conflict', priority: 'medium', timetableId: '' });
                }}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Timetable Selection */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700/50' : 'bg-blue-50 border border-blue-200'}`}>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  Select Timetable (Optional)
                </label>
                <select
                  value={newQuery.timetableId}
                  onChange={(e) => setNewQuery({ ...newQuery, timetableId: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">-- Select a timetable (if applicable) --</option>
                  {allTimetables.map((tt) => (
                    <option key={tt._id} value={tt._id}>
                      {tt.name || 'Untitled'} - {tt.academicYear || 'N/A'} - {tt.semester || 'N/A'}
                    </option>
                  ))}
                </select>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Select a timetable if your query is about a specific schedule
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject *
                </label>
                <input
                  type="text"
                  value={newQuery.subject}
                  onChange={(e) => setNewQuery({ ...newQuery, subject: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., Class timing conflict on Monday"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description *
                </label>
                <textarea
                  value={newQuery.description}
                  onChange={(e) => setNewQuery({ ...newQuery, description: e.target.value })}
                  rows={4}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Describe your query in detail (e.g., Both CS101 and MATH201 scheduled at 10 AM on Monday)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Query Type *
                  </label>
                  <select
                    value={newQuery.type}
                    onChange={(e) => setNewQuery({ ...newQuery, type: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="timetable-conflict">Timetable Conflict</option>
                    <option value="schedule-change">Schedule Change Request</option>
                    <option value="general">General Query</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Priority *
                  </label>
                  <select
                    value={newQuery.priority}
                    onChange={(e) => setNewQuery({ ...newQuery, priority: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Help Text */}
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Tip:</strong> Be specific about the issue. Include times, dates, and course codes if applicable. 
                  Admin will review and respond to your query soon.
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowQueryModal(false);
                    setNewQuery({ subject: '', description: '', type: 'timetable-conflict', priority: 'medium', timetableId: '' });
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
                  onClick={handleCreateQuery}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Query to Admin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Component */}
      <Chatbot />
    </div>
  );
};

export default StudentDashboard; 