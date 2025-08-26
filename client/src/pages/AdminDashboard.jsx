import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Bell,
  Clock,
  MapPin,
  BookOpen,
  GraduationCap,
  Building2,
  TrendingUp,
  Activity,
  PieChart,
  Sun,
  Moon
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    { title: 'Total Students', value: '1,234', change: '+12%', icon: GraduationCap, color: 'blue' },
    { title: 'Total Teachers', value: '89', change: '+5%', icon: Users, color: 'green' },
    { title: 'Active Classes', value: '45', change: '+8%', icon: BookOpen, color: 'purple' },
    { title: 'Rooms Available', value: '23', change: '+3%', icon: Building2, color: 'orange' }
  ];

  const recentTimetables = [
    { id: 1, name: 'Computer Science - Semester 1', status: 'Active', lastUpdated: '2 hours ago', conflicts: 0 },
    { id: 2, name: 'Engineering - Year 2', status: 'Draft', lastUpdated: '1 day ago', conflicts: 2 },
    { id: 3, name: 'Business Administration', status: 'Active', lastUpdated: '3 days ago', conflicts: 0 },
    { id: 4, name: 'Medical Sciences', status: 'Review', lastUpdated: '1 week ago', conflicts: 1 }
  ];

  const notifications = [
    { id: 1, message: 'New timetable conflict detected in Engineering Year 2', time: '5 min ago', type: 'warning' },
    { id: 2, message: 'Timetable generation completed for Computer Science', time: '1 hour ago', type: 'success' },
    { id: 3, message: 'Room booking request from Dr. Smith', time: '2 hours ago', type: 'info' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`rounded-xl p-6 border transition-all duration-300 hover:shadow-lg ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 hover:shadow-gray-900/20' 
              : 'bg-white border-gray-200 hover:shadow-lg'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.title}</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={`rounded-xl border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className={`p-6 border-b ${
          isDarkMode 
            ? 'border-gray-700' 
            : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/create-timetable')}
              className={`flex items-center justify-center p-4 border rounded-lg transition-colors group ${
                isDarkMode 
                  ? 'bg-blue-900/30 hover:bg-blue-900/50 border-blue-700/50' 
                  : 'bg-blue-50 hover:bg-blue-100 border-blue-200'
              }`}
            >
              <Plus className="w-6 h-6 text-blue-600 mr-3" />
              <span className={`font-medium ${
                isDarkMode ? 'text-blue-300' : 'text-blue-900'
              }`}>Create New Timetable</span>
            </button>
            <button 
              onClick={() => navigate('/student-management')}
              className={`flex items-center justify-center p-4 border rounded-lg transition-colors group ${
                isDarkMode 
                  ? 'bg-indigo-900/30 hover:bg-indigo-900/50 border-indigo-700/50' 
                  : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
              }`}
            >
              <GraduationCap className="w-6 h-6 text-indigo-600 mr-3" />
              <span className={`font-medium ${
                isDarkMode ? 'text-indigo-300' : 'text-indigo-900'
              }`}>Manage Students</span>
            </button>
            <button 
              onClick={() => navigate('/teachers-data')}
              className={`flex items-center justify-center p-4 border rounded-lg transition-colors group ${
                isDarkMode 
                  ? 'bg-yellow-900/30 hover:bg-yellow-900/50 border-yellow-700/50' 
                  : 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
              }`}
            >
              <Users className="w-6 h-6 text-yellow-600 mr-3" />
              <span className={`font-medium ${
                isDarkMode ? 'text-yellow-300' : 'text-yellow-900'
              }`}>Manage Teachers</span>
            </button>
            <button 
              onClick={() => navigate('/classrooms-data')}
              className={`flex items-center justify-center p-4 border rounded-lg transition-colors group ${
                isDarkMode 
                  ? 'bg-orange-900/30 hover:bg-orange-900/50 border-orange-700/50' 
                  : 'bg-orange-50 hover:bg-orange-100 border-orange-200'
              }`}
            >
              <Settings className="w-6 h-6 text-orange-600 mr-3" />
              <span className={`font-medium ${
                isDarkMode ? 'text-orange-300' : 'text-orange-900'
              }`}>Manage Rooms</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <button 
              onClick={() => navigate('/programs-data')}
              className={`flex items-center justify-center p-4 border rounded-lg transition-colors group ${
                isDarkMode 
                  ? 'bg-purple-900/30 hover:bg-purple-900/50 border-purple-700/50' 
                  : 'bg-purple-50 hover:bg-purple-100 border-purple-200'
              }`}
            >
              <Building2 className="w-6 h-6 text-purple-600 mr-3" />
              <span className={`font-medium ${
                isDarkMode ? 'text-purple-300' : 'text-purple-900'
              }`}>Manage Programs</span>
            </button>
            <button 
              onClick={() => navigate('/infrastructure-data')}
              className={`flex items-center justify-center p-4 border rounded-lg transition-colors group ${
                isDarkMode 
                  ? 'bg-orange-900/30 hover:bg-orange-900/50 border-orange-700/50' 
                  : 'bg-orange-50 hover:bg-orange-100 border-orange-200'
              }`}
            >
              <BookOpen className="w-6 h-6 text-orange-600 mr-3" />
              <span className={`font-medium ${
                isDarkMode ? 'text-orange-300' : 'text-orange-900'
              }`}>Infrastructure & Policy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Timetables */}
      <div className={`rounded-xl border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className={`p-6 border-b ${
          isDarkMode 
            ? 'border-gray-700' 
            : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Recent Timetables</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentTimetables.map((timetable) => (
              <div key={timetable.id} className={`flex items-center justify-between p-4 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700/50' 
                  : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className={`font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>{timetable.name}</h4>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Updated {timetable.lastUpdated}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    timetable.status === 'Active' ? (isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800') :
                    timetable.status === 'Draft' ? (isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800') :
                    (isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800')
                  }`}>
                    {timetable.status}
                  </span>
                  {timetable.conflicts > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
                    }`}>
                      {timetable.conflicts} conflicts
                    </span>
                  )}
                  <button className={`p-2 transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                  }`}>
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className={`p-2 transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                  }`}>
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className={`rounded-xl border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Recent Notifications</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  notification.type === 'warning' ? 'bg-yellow-500' :
                  notification.type === 'success' ? 'bg-green-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>{notification.message}</p>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTimetables = () => (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/create-timetable')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Timetable</span>
          </button>
          <button className={`px-4 py-2 border rounded-lg transition-colors flex items-center space-x-2 ${
            isDarkMode 
              ? 'border-gray-600 text-gray-200 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}>
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className={`absolute left-3 top-3 w-4 h-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search timetables..."
              className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
          <button className={`p-2 border rounded-lg transition-colors ${
            isDarkMode 
              ? 'border-gray-600 hover:bg-gray-700' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}>
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timetables List */}
      <div className={`rounded-xl border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>All Timetables</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentTimetables.map((timetable) => (
              <div key={timetable.id} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}>
                <div className="flex items-center space-x-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{timetable.name}</h4>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Updated {timetable.lastUpdated}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    timetable.status === 'Active' ? (isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800') :
                    timetable.status === 'Draft' ? (isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800') :
                    (isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800')
                  }`}>
                    {timetable.status}
                  </span>
                  <button className={`p-2 transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-600'
                  }`}>
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className={`p-2 transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-400 hover:text-green-600'
                  }`}>
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className={`p-2 transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-600'
                  }`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className={`p-2 transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-400 hover:text-purple-600'
                  }`}>
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>User Management</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>
      
      <div className={`rounded-xl border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`text-center p-6 rounded-lg ${
              isDarkMode ? 'bg-blue-900' : 'bg-blue-50'
            }`}>
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>1,234</h4>
              <p className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Total Students</p>
            </div>
            <div className={`text-center p-6 rounded-lg ${
              isDarkMode ? 'bg-green-900' : 'bg-green-50'
            }`}>
              <GraduationCap className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>89</h4>
              <p className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Total Teachers</p>
            </div>
            <div className={`text-center p-6 rounded-lg ${
              isDarkMode ? 'bg-purple-900' : 'bg-purple-50'
            }`}>
              <Building2 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h4 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>23</h4>
              <p className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Available Rooms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-xl border p-6 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Timetable Conflicts</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>This Week</span>
              <span className="font-semibold text-red-600">5 conflicts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Last Week</span>
              <span className="font-semibold text-orange-600">12 conflicts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>This Month</span>
              <span className="font-semibold text-green-600">23 conflicts</span>
            </div>
          </div>
        </div>
        
        <div className={`rounded-xl border p-6 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Room Utilization</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Computer Lab 1</span>
              <span className="font-semibold text-blue-600">85%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Lecture Hall A</span>
              <span className="font-semibold text-green-600">92%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Science Lab</span>
              <span className="font-semibold text-purple-600">78%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`border-b transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className={`p-2 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}>
                <Bell className="w-5 h-5" />
              </button>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center space-x-3">
                <img 
                  src={user?.avatar || 'https://via.placeholder.com/32'} 
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{user?.name}</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className={`flex space-x-1 rounded-lg p-1 border mb-8 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'timetables', label: 'Timetables', icon: Calendar },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'timetables' && renderTimetables()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default AdminDashboard;