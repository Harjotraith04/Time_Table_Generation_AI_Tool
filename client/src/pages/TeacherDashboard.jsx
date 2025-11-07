import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Chatbot from '../components/Chatbot';
import AdminSidebar from '../components/AdminSidebar';
import { getTimetables } from '../services/api';
import { 
  Calendar, 
  BookOpen, 
  Clock, 
  MapPin, 
  User, 
  LogOut, 
  Bell,
  Download,
  Eye,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  Sun,
  Moon,
  Loader
} from 'lucide-react';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('timetable');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timetableData, setTimetableData] = useState(null);

  useEffect(() => {
    fetchTeacherTimetable();
  }, []);

  const fetchTeacherTimetable = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTimetables();
      const timetables = response.data || response.timetables || [];
      // Filter by teacher ID in real system
      if (timetables.length > 0) {
        setTimetableData(timetables[0]);
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

  const currentWeek = [];
  const courses = [];
  const notifications = [];
  const upcomingTasks = [];

  const renderTimetable = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>My Teaching Schedule</h3>
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

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin mr-3" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading schedule...</span>
        </div>
      )}

      {!loading && currentWeek.length === 0 && (
        <div className="text-center py-12">
          <Calendar className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            No Schedule Available
          </h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Your teaching schedule will appear here once assigned.
          </p>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Download Schedule</span>
        </button>
        <button className={`px-4 py-2 border rounded-lg transition-colors flex items-center space-x-2 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
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
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            No Courses Assigned
          </h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            You haven't been assigned any courses yet.
          </p>
        </div>
      ) : null}
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Upcoming Tasks</h3>
      
      {upcomingTasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            No Upcoming Tasks
          </h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            You're all caught up! Check back later for new tasks.
          </p>
        </div>
      ) : null}
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
      ) : null}
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <header className={`border-b transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Teacher Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className={`p-2 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <Bell className="w-5 h-5" />
              </button>
              
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center space-x-3">
                <img 
                  src={user?.avatar || 'https://via.placeholder.com/32'} 
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{user?.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className={`p-2 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-600'}`}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-0 pt-16 pb-8">
        <div className="w-full flex">
          <AdminSidebar 
            showQuickActions={false} 
            userRole="teacher" 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Welcome back, {user?.name}!</h2>
                    <p className="text-blue-100">Here's your teaching overview for this week</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className={`rounded-xl p-6 border transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Courses</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>4</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className={`rounded-xl p-6 border transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Classes Today</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>5</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className={`rounded-xl p-6 border transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>120</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                      <Users className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
                
                <div className={`rounded-xl p-6 border transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hours This Week</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>18</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`flex space-x-1 rounded-lg p-1 border mb-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {[
                  { id: 'timetable', label: 'Schedule', icon: Calendar },
                  { id: 'courses', label: 'Courses', icon: BookOpen },
                  { id: 'assignments', label: 'Tasks', icon: CheckCircle },
                  { id: 'notifications', label: 'Notifications', icon: Bell }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
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

              {activeTab === 'timetable' && renderTimetable()}
              {activeTab === 'courses' && renderCourses()}
              {activeTab === 'assignments' && renderAssignments()}
              {activeTab === 'notifications' && renderNotifications()}
            </div>
          </main>
        </div>
      </div>

      <Chatbot />
    </div>
  );
};

export default TeacherDashboard;
