import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { 
  Calendar, 
  Eye, 
  ArrowLeft,
  Download,
  Share2,
  RefreshCw,
  Filter,
  Search,
  Grid3X3,
  List,
  Clock,
  MapPin,
  User,
  BookOpen,
  Users,
  Building2,
  ChevronDown,
  ChevronUp,
  Edit2,
  AlertCircle,
  CheckCircle,
  Printer,
  Mail
} from 'lucide-react';

const ViewTimetable = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [viewType, setViewType] = useState('grid'); // 'grid', 'list'
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'teacher', 'program', 'room'
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedDay, setSelectedDay] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Sample timetable data
  const timetableData = [
    {
      id: 'T001',
      day: 'Monday',
      time: '09:00-10:00',
      course: 'Data Structures',
      teacher: 'Dr. Sarah Johnson',
      program: 'Computer Science - Sem 3',
      room: 'R101',
      type: 'Theory',
      students: 60,
      conflicts: []
    },
    {
      id: 'T002',
      day: 'Monday',
      time: '10:00-11:00',
      course: 'Database Systems',
      teacher: 'Prof. Michael Chen',
      program: 'Computer Science - Sem 4',
      room: 'R102',
      type: 'Theory',
      students: 55,
      conflicts: []
    },
    {
      id: 'T003',
      day: 'Monday',
      time: '11:30-13:30',
      course: 'Data Structures Lab',
      teacher: 'Dr. Sarah Johnson',
      program: 'Computer Science - Sem 3 (Batch A)',
      room: 'L201',
      type: 'Lab',
      students: 20,
      conflicts: []
    },
    {
      id: 'T004',
      day: 'Monday',
      time: '14:00-15:00',
      course: 'Linear Algebra',
      teacher: 'Dr. Emily Rodriguez',
      program: 'Mathematics - Sem 2',
      room: 'R103',
      type: 'Theory',
      students: 45,
      conflicts: []
    },
    {
      id: 'T005',
      day: 'Tuesday',
      time: '09:00-10:00',
      course: 'Software Engineering',
      teacher: 'Prof. Michael Chen',
      program: 'Computer Science - Sem 5',
      room: 'R101',
      type: 'Theory',
      students: 50,
      conflicts: []
    },
    {
      id: 'T006',
      day: 'Tuesday',
      time: '10:00-11:00',
      course: 'Machine Learning',
      teacher: 'Dr. Sarah Johnson',
      program: 'Computer Science - Sem 7',
      room: 'R102',
      type: 'Theory',
      students: 40,
      conflicts: []
    },
    {
      id: 'T007',
      day: 'Wednesday',
      time: '09:00-10:00',
      course: 'Statistics',
      teacher: 'Dr. Emily Rodriguez',
      program: 'Mathematics - Sem 3',
      room: 'R103',
      type: 'Theory',
      students: 35,
      conflicts: []
    },
    {
      id: 'T008',
      day: 'Wednesday',
      time: '11:30-13:30',
      course: 'Database Lab',
      teacher: 'Prof. Michael Chen',
      program: 'Computer Science - Sem 4 (Batch B)',
      room: 'L202',
      type: 'Lab',
      students: 18,
      conflicts: []
    }
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'
  ];

  const teachers = [...new Set(timetableData.map(item => item.teacher))];
  const programs = [...new Set(timetableData.map(item => item.program))];
  const rooms = [...new Set(timetableData.map(item => item.room))];

  const handleBack = () => {
    navigate('/generate-timetable');
  };

  const getFilteredData = () => {
    let filtered = timetableData;

    // Filter by entity type
    if (selectedFilter !== 'all' && selectedEntity) {
      switch (selectedFilter) {
        case 'teacher':
          filtered = filtered.filter(item => item.teacher === selectedEntity);
          break;
        case 'program':
          filtered = filtered.filter(item => item.program === selectedEntity);
          break;
        case 'room':
          filtered = filtered.filter(item => item.room === selectedEntity);
          break;
      }
    }

    // Filter by day
    if (selectedDay !== 'all') {
      filtered = filtered.filter(item => item.day === selectedDay);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.room.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getClassForTimeSlot = (day, timeSlot) => {
    return timetableData.find(item => item.day === day && item.time === timeSlot);
  };

  const renderGridView = () => {
    const filteredData = getFilteredData();
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Timetable Grid</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                  Time
                </th>
                {daysOfWeek.map(day => (
                  <th key={day} className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {timeSlots.map(timeSlot => (
                <tr key={timeSlot} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-6 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                    {timeSlot}
                  </td>
                  {daysOfWeek.map(day => {
                    const classData = getClassForTimeSlot(day, timeSlot);
                    return (
                      <td key={`${day}-${timeSlot}`} className="px-2 py-2 text-center">
                        {classData ? (
                          <div className={`p-3 rounded-lg text-xs ${
                            classData.type === 'Lab' 
                              ? 'bg-purple-100 dark:bg-purple-900 border border-purple-200 dark:border-purple-800'
                              : 'bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800'
                          }`}>
                            <div className="font-semibold text-gray-900 dark:text-white mb-1">
                              {classData.course}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 mb-1">
                              {classData.teacher}
                            </div>
                            <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
                              <MapPin className="w-3 h-3" />
                              <span>{classData.room}</span>
                            </div>
                            <div className="mt-1 text-gray-500 dark:text-gray-400">
                              {classData.students} students
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 text-gray-400 dark:text-gray-600">
                            <div className="text-xs">Free</div>
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

  const renderListView = () => {
    const filteredData = getFilteredData();
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Class Schedule List</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredData.length} classes
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredData.map((classItem) => (
            <div key={classItem.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {classItem.course}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded ${
                      classItem.type === 'Lab' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {classItem.type}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{classItem.day}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{classItem.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{classItem.teacher}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{classItem.room}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {classItem.program}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{classItem.students} students</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Search</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <Filter className="w-4 h-4" />
          <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search courses, teachers, rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter By</label>
            <select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setSelectedEntity('');
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Classes</option>
              <option value="teacher">Teacher</option>
              <option value="program">Program</option>
              <option value="room">Room</option>
            </select>
          </div>

          {selectedFilter !== 'all' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
              </label>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All {selectedFilter}s</option>
                {(selectedFilter === 'teacher' ? teachers : 
                  selectedFilter === 'program' ? programs : rooms).map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Days</option>
              {daysOfWeek.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">View</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewType('grid')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded ${
                  viewType === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Grid3X3 className="w-4 h-4 mr-1" />
                Grid
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded ${
                  viewType === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <List className="w-4 h-4 mr-1" />
                List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Classes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{timetableData.length}</p>
          </div>
          <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Teachers Scheduled</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{teachers.length}</p>
          </div>
          <User className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rooms Utilized</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{rooms.length}</p>
          </div>
          <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Conflicts</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">View Timetable</h1>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Generated Timetable</h2>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage your AI-generated academic timetable
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBack}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Stats */}
          {renderStats()}

          {/* Filters */}
          {renderFilters()}

          {/* Success Message */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Timetable Successfully Generated</h4>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Your timetable has been generated with 0 conflicts and optimal resource utilization. 
                  All constraints have been satisfied successfully.
                </p>
              </div>
            </div>
          </div>

          {/* Timetable View */}
          {viewType === 'grid' ? renderGridView() : renderListView()}
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-between">
          <button 
            onClick={handleBack}
            className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Generation
          </button>
          
          <div className="flex space-x-4">
            <button 
              onClick={() => navigate('/generate-timetable')}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </button>
            <button 
              onClick={() => navigate('/admin-dashboard')}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Save & Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTimetable;
