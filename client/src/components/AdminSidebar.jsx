import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
  Plus,
  GraduationCap,
  Settings,
  Building2,
  BookOpen
} from 'lucide-react';

const AdminSidebar = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  // Determine active section based on current path if not on dashboard
  const getActiveTab = () => {
    if (activeTab) return activeTab; // Use prop if provided (for dashboard)
    
    const path = location.pathname;
    if (path === '/admin-dashboard') return 'overview';
    if (path.includes('timetable')) return 'timetables';
    if (path.includes('student') || path.includes('teacher') || path.includes('user')) return 'users';
    if (path.includes('analytics')) return 'analytics';
    return '';
  };

  const currentTab = getActiveTab();

  const navigationTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, path: '/admin-dashboard' },
    { id: 'timetables', label: 'Timetables', icon: Calendar, path: '/admin-dashboard' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin-dashboard' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/admin-dashboard' }
  ];

  const quickActions = [
    { label: 'Create Timetable', icon: Plus, color: 'bg-blue-700 hover:bg-blue-600', path: '/create-timetable' },
    { label: 'Manage Students', icon: GraduationCap, color: 'bg-indigo-700 hover:bg-indigo-600', path: '/student-management' },
    { label: 'Manage Teachers', icon: Users, color: 'bg-yellow-700 hover:bg-yellow-600', path: '/teachers-data' },
    { label: 'Manage Rooms', icon: Settings, color: 'bg-orange-700 hover:bg-orange-600', path: '/classrooms-data' },
    { label: 'Manage Programs', icon: Building2, color: 'bg-purple-700 hover:bg-purple-600', path: '/programs-data' },
    { label: 'Infrastructure & Policy', icon: BookOpen, color: 'bg-green-700 hover:bg-green-600', path: '/infrastructure-data' }
  ];

  const handleNavigation = (path, tabId) => {
    if (tabId && path === '/admin-dashboard') {
      // For dashboard tabs, call the callback if provided
      if (onTabChange) {
        onTabChange(tabId);
      } else {
        navigate(path, { state: { activeTab: tabId } });
      }
    } else {
      navigate(path);
    }
  };

  return (
    <aside
      className={`w-72 sticky top-16 rounded-none p-4 border-r shadow-lg ${
        isDarkMode 
          ? 'bg-gradient-to-b from-gray-900 to-black border-gray-800' 
          : 'bg-white border-gray-200'
      }`}
      style={{ maxHeight: 'calc(100vh - 4rem)', overflow: 'auto' }}
    >
      {/* Main Navigation */}
      <nav className="space-y-2 mb-6">
        {navigationTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleNavigation(tab.path, tab.id)}
            className={`relative w-full flex items-center space-x-3 pl-6 pr-4 py-3 rounded-lg transition-all duration-200 text-left ${
              currentTab === tab.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {currentTab === tab.id && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-md" />
            )}
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Quick Actions */}
      <div className={`border-t pt-4 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Quick Actions
        </h4>
        <div className="space-y-3">
          {quickActions.map((action, index) => {
            const isActive = location.pathname === action.path;
            return (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-white ${action.color} ${
                  isActive ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900' : ''
                }`}
              >
                <action.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
