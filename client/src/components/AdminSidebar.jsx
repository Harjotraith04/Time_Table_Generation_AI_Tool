import React, { useState } from 'react';
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
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Home,
  Table,
  CheckCircle,
  Bell
} from 'lucide-react';

const AdminSidebar = ({ activeTab, onTabChange, showQuickActions = true, userRole = 'admin' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('adminSidebarCollapsed');
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleToggleCollapsed = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('adminSidebarCollapsed', next ? 'true' : 'false'); } catch (e) {}
      return next;
    });
  };

  // Determine active section based on current path if not on dashboard
  const getActiveTab = () => {
    const path = location.pathname;

    // Check if we're on any of the special pages
    if (path === '/view-timetable' || path.startsWith('/view-timetable/')) return 'timetables';
    if (path === '/query-resolution') return 'users';
    if (path === '/student-dashboard') return activeTab || 'timetable';
    if (path === '/teacher-dashboard') return activeTab || 'timetable';
    
    // Use explicit prop/state for dashboard tab highlighting only.
    if (activeTab) return activeTab;

    if (path === '/admin-dashboard') {
      return (location.state && location.state.activeTab) ? location.state.activeTab : 'overview';
    }

    return '';
  };

  const currentTab = getActiveTab();

  // Define navigation tabs based on user role
  const getNavigationTabs = () => {
    if (userRole === 'student') {
      return [
        { id: 'timetable', label: 'My Timetable', icon: Calendar, path: '/student-dashboard' },
        { id: 'courses', label: 'My Courses', icon: BookOpen, path: '/student-dashboard' },
        { id: 'assignments', label: 'Assignments', icon: CheckCircle, path: '/student-dashboard' },
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/student-dashboard' }
      ];
    }
    
    if (userRole === 'teacher' || userRole === 'faculty') {
      return [
        { id: 'timetable', label: 'My Schedule', icon: Calendar, path: '/teacher-dashboard' },
        { id: 'courses', label: 'My Courses', icon: BookOpen, path: '/teacher-dashboard' },
        { id: 'assignments', label: 'Query Raised', icon: Users, path: '/teacher-dashboard' },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/teacher-dashboard' },
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/teacher-dashboard' }
      ];
    }
    
    // Admin tabs
    return [
      { id: 'overview', label: 'Overview', icon: BarChart3, path: '/admin-dashboard' },
      { id: 'timetables', label: 'All Time Tables', icon: Calendar, path: '/view-timetable' },
      { id: 'users', label: 'Query Resolution', icon: Users, path: '/query-resolution' },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/admin-dashboard' }
    ];
  };

  const navigationTabs = getNavigationTabs();

  const quickActions = [
    { label: 'Create Timetable', icon: Plus, color: 'bg-blue-700 hover:bg-blue-600', path: '/create-timetable' },
    { label: 'Manage Students', icon: GraduationCap, color: 'bg-indigo-700 hover:bg-indigo-600', path: '/student-management' },
    { label: 'Manage Teachers', icon: Users, color: 'bg-yellow-700 hover:bg-yellow-600', path: '/teachers-data' },
    { label: 'Manage Rooms', icon: Settings, color: 'bg-orange-700 hover:bg-orange-600', path: '/classrooms-data' },
    { label: 'Manage Programs', icon: Building2, color: 'bg-purple-700 hover:bg-purple-600', path: '/programs-data' },
    { label: 'Infrastructure & Policy', icon: BookOpen, color: 'bg-green-700 hover:bg-green-600', path: '/infrastructure-data' }
  ];

  const handleNavigation = (path, tabId) => {
    if (path === '/view-timetable' || path === '/query-resolution') {
      // Navigate directly to these pages
      navigate(path);
    } else if (tabId && (path === '/admin-dashboard' || path === '/student-dashboard' || path === '/teacher-dashboard')) {
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
      className={`${isCollapsed ? 'w-20' : 'w-72'} sticky top-16 rounded-2xl border-r shadow-2xl transition-all duration-300 ease-in-out ${
        isDarkMode 
          ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-gray-800' 
          : 'bg-gradient-to-b from-white via-gray-50 to-gray-100 border-gray-200'
      }`}
      // allow the decorative collapse control to overflow so it isn't clipped
      style={{ maxHeight: 'calc(100vh - 4rem)', overflow: 'visible' }}
    >
      {/* Collapse/Expand Button - decorative half-circle and circular button. Only the button toggles (decorative circle is non-interactive) */}
      {/* Use a fixed position for the control so it doesn't shift when toggling collapse state */}
      <div className={`absolute top-4 z-20 -right-4 flex items-center justify-center`} style={{ pointerEvents: 'none' }}>
        {/* Decorative semicircle behind the button (non-interactive) */}
        <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60' : 'bg-white/80'} shadow-2xl ring-4 ring-white`} style={{ filter: 'blur(0.2px)', opacity: 0.95 }} />
        {/* Actual interactive circular button (on top) */}
        <button
          onClick={handleToggleCollapsed}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`absolute p-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 border focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isDarkMode ? 'bg-gradient-to-br from-blue-700 to-purple-700 text-white border-transparent' : 'bg-white border-gray-200 text-gray-700'
          }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          style={{ pointerEvents: 'auto' }}
        >
          <ChevronLeft className={`w-4 h-4 transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} />
        </button>
      </div>

      <div className="h-full overflow-y-auto overflow-x-hidden p-3 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
        {/* Top spacer to add breathing room so the collapse control doesn't overlap the first nav item */}
        <div className={isCollapsed ? 'h-10' : 'h-6'} />
        {/* Top branding removed (icon removed as requested) */}

        {/* Main Navigation */}
  <nav className="space-y-1 mb-3">
          {!isCollapsed && (
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-3 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Navigation
            </h4>
          )}
          {navigationTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleNavigation(tab.path, tab.id)}
              className={`relative w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} ${
                isCollapsed ? 'px-3' : 'pl-6 pr-4'
              } py-2.5 rounded-lg transition-all duration-200 text-left group ${
                currentTab === tab.id 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-[1.02]' 
                  : isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900 hover:shadow-md'
              }`}
              title={isCollapsed ? tab.label : ''}
            >
              {currentTab === tab.id && !isCollapsed && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-md" />
              )}
              <tab.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} ${
                currentTab === tab.id ? 'text-white' : ''
              } transition-transform group-hover:scale-110`} />
              {!isCollapsed && (
                <span className="font-medium flex-1">{tab.label}</span>
              )}
              {!isCollapsed && currentTab === tab.id && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        {/* Quick Actions (optional) */}
        {showQuickActions && (
          <div className={`border-t pt-2 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            {!isCollapsed && (
              <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-3 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Quick Actions
              </h4>
            )}
            <div className="space-y-2">
              {quickActions.map((action, index) => {
                const isActive = location.pathname === action.path;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} ${
                      isCollapsed ? 'px-3' : 'px-4'
                    } py-2.5 rounded-lg transition-all duration-200 text-white ${action.color} ${
                      isActive ? 'ring-2 ring-white ring-opacity-50 shadow-xl scale-[1.02]' : 'shadow-md hover:shadow-lg hover:scale-[1.02]'
                    } group`}
                    title={isCollapsed ? action.label : ''}
                  >
                    <action.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} transition-transform group-hover:scale-110`} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium flex-1 text-left">{action.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Help box removed per request */}
      </div>
    </aside>
  );
};

export default AdminSidebar;
