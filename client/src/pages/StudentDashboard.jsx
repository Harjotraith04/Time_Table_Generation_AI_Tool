import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Eye,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Plus
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('timetable');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentWeek = [
    { day: 'Monday', date: '15', classes: [
      { time: '09:00 - 10:30', subject: 'Computer Science', room: 'Lab 101', teacher: 'Dr. Smith' },
      { time: '11:00 - 12:30', subject: 'Mathematics', room: 'Room 205', teacher: 'Prof. Johnson' },
      { time: '14:00 - 15:30', subject: 'Physics', room: 'Lab 203', teacher: 'Dr. Brown' }
    ]},
    { day: 'Tuesday', date: '16', classes: [
      { time: '09:00 - 10:30', subject: 'English Literature', room: 'Room 301', teacher: 'Prof. Davis' },
      { time: '11:00 - 12:30', subject: 'Computer Science', room: 'Lab 101', teacher: 'Dr. Smith' }
    ]},
    { day: 'Wednesday', date: '17', classes: [
      { time: '09:00 - 10:30', subject: 'Mathematics', room: 'Room 205', teacher: 'Prof. Johnson' },
      { time: '11:00 - 12:30', subject: 'History', room: 'Room 401', teacher: 'Dr. Wilson' },
      { time: '14:00 - 15:30', subject: 'Computer Science', room: 'Lab 101', teacher: 'Dr. Smith' }
    ]},
    { day: 'Thursday', date: '18', classes: [
      { time: '09:00 - 10:30', subject: 'Physics', room: 'Lab 203', teacher: 'Dr. Brown' },
      { time: '11:00 - 12:30', subject: 'English Literature', room: 'Room 301', teacher: 'Prof. Davis' }
    ]},
    { day: 'Friday', date: '19', classes: [
      { time: '09:00 - 10:30', subject: 'Mathematics', room: 'Room 205', teacher: 'Prof. Johnson' },
      { time: '11:00 - 12:30', subject: 'Computer Science', room: 'Lab 101', teacher: 'Dr. Smith' },
      { time: '14:00 - 15:30', subject: 'History', room: 'Room 401', teacher: 'Dr. Wilson' }
    ]}
  ];

  const courses = [
    { id: 1, name: 'Computer Science', code: 'CS101', credits: 4, grade: 'A-', progress: 85 },
    { id: 2, name: 'Mathematics', code: 'MATH201', credits: 3, grade: 'B+', progress: 78 },
    { id: 3, name: 'Physics', code: 'PHY101', credits: 4, grade: 'A', progress: 92 },
    { id: 4, name: 'English Literature', code: 'ENG201', credits: 3, grade: 'B', progress: 70 },
    { id: 5, name: 'History', code: 'HIST101', credits: 3, grade: 'A-', progress: 88 }
  ];

  const notifications = [
    { id: 1, message: 'Assignment due tomorrow: Computer Science Lab Report', time: '2 hours ago', type: 'warning' },
    { id: 2, message: 'New grade posted for Mathematics Quiz', time: '1 day ago', type: 'success' },
    { id: 3, message: 'Room change: Physics Lab moved to Lab 205', time: '2 days ago', type: 'info' }
  ];

  const upcomingAssignments = [
    { id: 1, subject: 'Computer Science', title: 'Lab Report #3', dueDate: 'Tomorrow', priority: 'high' },
    { id: 2, subject: 'Mathematics', title: 'Calculus Problem Set', dueDate: 'Friday', priority: 'medium' },
    { id: 3, subject: 'Physics', title: 'Experiment Report', dueDate: 'Next Monday', priority: 'low' }
  ];

  const renderTimetable = () => (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">This Week's Schedule</h3>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-600">Week of March 15-19</span>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {currentWeek.map((day, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-center mb-4">
              <h4 className="font-semibold text-gray-900">{day.day}</h4>
              <p className="text-sm text-gray-500">March {day.date}</p>
            </div>
            
            <div className="space-y-3">
              {day.classes.map((classItem, classIndex) => (
                <div key={classIndex} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-700">{classItem.time}</span>
                    <span className="text-xs text-blue-600">{classItem.room}</span>
                  </div>
                  <h5 className="font-medium text-gray-900 text-sm mb-1">{classItem.subject}</h5>
                  <p className="text-xs text-gray-600">{classItem.teacher}</p>
                </div>
              ))}
              
              {day.classes.length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  <p className="text-sm">No classes</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Download Timetable</span>
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
          <Eye className="w-4 h-4" />
          <span>View Full Schedule</span>
        </button>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.grade === 'A' || course.grade === 'A-' ? 'bg-green-100 text-green-800' :
                course.grade === 'B+' || course.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {course.grade}
              </span>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-1">{course.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{course.code} • {course.credits} credits</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium text-gray-900">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h3>
      
      <div className="space-y-4">
        {upcomingAssignments.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  assignment.priority === 'high' ? 'bg-red-500' :
                  assignment.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <div>
                  <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                  <p className="text-sm text-gray-600">{assignment.subject}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{assignment.dueDate}</p>
                <p className={`text-xs ${
                  assignment.priority === 'high' ? 'text-red-600' :
                  assignment.priority === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {assignment.priority} priority
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
      
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                notification.type === 'warning' ? 'bg-yellow-500' :
                notification.type === 'success' ? 'bg-green-500' :
                'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Student Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <img 
                  src={user?.avatar} 
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user?.name}!</h2>
              <p className="text-blue-100">Here's your academic overview for this week</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Classes Today</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assignments Due</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">GPA</p>
                <p className="text-2xl font-bold text-gray-900">3.7</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 border border-gray-200 mb-8">
          {[
            { id: 'timetable', label: 'Timetable', icon: Calendar },
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'assignments', label: 'Assignments', icon: CheckCircle },
            { id: 'notifications', label: 'Notifications', icon: Bell }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
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
        {activeTab === 'assignments' && renderAssignments()}
        {activeTab === 'notifications' && renderNotifications()}
      </div>
    </div>
  );
};

export default StudentDashboard; 