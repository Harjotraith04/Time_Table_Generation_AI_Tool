import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import AdminSidebar from '../components/AdminSidebar';
import { 
  Settings,
  ArrowLeft,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Clock,
  Calendar,
  Users,
  Coffee,
  CheckCircle,
  School,
  BookOpen,
  MapPin,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

const InfrastructureData = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('policies');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [configId, setConfigId] = useState(null);

  // Infrastructure data state
  const [generalPolicies, setGeneralPolicies] = useState({
    maxConsecutiveHours: 3,
    maxDailyHours: 8,
    minBreakBetweenSessions: 15,
    maxTeachingHoursPerDay: 6,
    preferredClassroomUtilization: 80,
    allowBackToBackLabs: false,
    prioritizeTeacherPreferences: true,
    allowSplitSessions: false,
    maxStudentsPerClass: 60,
    minRoomCapacityBuffer: 10,
    allowOverlappingLabs: false,
    prioritizeCoreBefore: true,
    avoidFirstLastPeriod: false,
    requireLabAssistant: true
  });

  const [workingHours, setWorkingHours] = useState({
    startTime: '09:00',
    endTime: '17:00',
    lunchBreakStart: '12:30',
    lunchBreakEnd: '13:30',
    periodDuration: 50,
    breakDuration: 10,
    labPeriodDuration: 120,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    maxPeriodsPerDay: 8,
    earlyMorningStart: '08:00',
    eveningEndTime: '18:00'
  });

  const [holidays, setHolidays] = useState([
    {
      id: 'HOL001',
      name: 'Independence Day',
      date: '2024-08-15',
      type: 'National Holiday',
      recurring: true,
      description: 'National holiday celebration'
    },
    {
      id: 'HOL002',
      name: 'Mid-Semester Exam Week',
      startDate: '2024-10-15',
      endDate: '2024-10-22',
      type: 'Examination',
      recurring: false,
      description: 'Mid-semester examinations for all programs'
    },
    {
      id: 'HOL003',
      name: 'Diwali Festival',
      date: '2024-11-12',
      type: 'Festival',
      recurring: true,
      description: 'Festival of lights celebration'
    }
  ]);

  const [academicCalendar, setAcademicCalendar] = useState({
    academicYearStart: '2024-07-01',
    academicYearEnd: '2025-06-30',
    semester1Start: '2024-07-01',
    semester1End: '2024-12-15',
    semester2Start: '2025-01-01',
    semester2End: '2025-06-30',
    totalWeeks: 16,
    examWeeks: 2,
    vacationWeeks: 4
  });

  const [constraintRules, setConstraintRules] = useState({
    minGapBetweenExams: 2,
    maxSubjectsPerDay: 6,
    preferMorningLabs: true,
    avoidFridayAfternoon: true,
    balanceWorkload: true,
    groupSimilarSubjects: false,
    maintainTeacherContinuity: true,
    prioritizePopularSlots: false
  });

  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    startDate: '',
    endDate: '',
    type: 'National Holiday',
    recurring: false,
    description: '',
    isDateRange: false
  });

  const holidayTypes = ['National Holiday', 'Festival', 'Examination', 'Vacation', 'Academic Event', 'Other'];

  // Fetch system configuration and holidays on component mount
  useEffect(() => {
    fetchSystemConfig();
    fetchHolidays();
  }, []);

  const fetchSystemConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/data/system-config`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch system configuration');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setConfigId(result.data._id);
        
        // Log fetched configuration
        console.log('='.repeat(60));
        console.log('📋 SYSTEM CONFIGURATION LOADED');
        console.log('='.repeat(60));
        console.log('Configuration:', JSON.stringify(result.data, null, 2));
        console.log('='.repeat(60));
        
        // Update states with fetched data
        if (result.data.generalPolicies) {
          setGeneralPolicies(result.data.generalPolicies);
        }
        if (result.data.workingHours) {
          setWorkingHours(result.data.workingHours);
        }
        if (result.data.academicCalendar) {
          const calendar = result.data.academicCalendar;
          setAcademicCalendar({
            academicYearStart: calendar.academicYearStart ? calendar.academicYearStart.split('T')[0] : '2024-07-01',
            academicYearEnd: calendar.academicYearEnd ? calendar.academicYearEnd.split('T')[0] : '2025-06-30',
            semester1Start: calendar.semester1Start ? calendar.semester1Start.split('T')[0] : '2024-07-01',
            semester1End: calendar.semester1End ? calendar.semester1End.split('T')[0] : '2024-12-15',
            semester2Start: calendar.semester2Start ? calendar.semester2Start.split('T')[0] : '2025-01-01',
            semester2End: calendar.semester2End ? calendar.semester2End.split('T')[0] : '2025-06-30',
            totalWeeks: calendar.totalWeeks || 16,
            examWeeks: calendar.examWeeks || 2,
            vacationWeeks: calendar.vacationWeeks || 4
          });
        }
        if (result.data.constraintRules) {
          setConstraintRules(result.data.constraintRules);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching system config:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/data/holidays?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch holidays');
      }

      const result = await response.json();
      if (result.success && result.data) {
        // Format dates for display
        const formattedHolidays = result.data.map(h => ({
          ...h,
          date: h.date ? h.date.split('T')[0] : undefined,
          startDate: h.startDate ? h.startDate.split('T')[0] : undefined,
          endDate: h.endDate ? h.endDate.split('T')[0] : undefined
        }));
        setHolidays(formattedHolidays);
        
        // Log fetched holidays
        console.log('='.repeat(60));
        console.log('📅 HOLIDAYS LOADED');
        console.log('='.repeat(60));
        console.log(`Total Holidays: ${formattedHolidays.length}`);
        console.log('Holidays:', JSON.stringify(formattedHolidays, null, 2));
        console.log('='.repeat(60));
      }
    } catch (err) {
      console.error('Error fetching holidays:', err);
    }
  };

  const saveConfiguration = async (section, data) => {
    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/data/system-config/${section}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to save ${section}`);
      }

      const result = await response.json();
      
      // Log the saved data to console
      console.log('='.repeat(60));
      console.log(`✅ ${section.toUpperCase()} SAVED SUCCESSFULLY`);
      console.log('='.repeat(60));
      console.log('Saved Data:', JSON.stringify(result.data, null, 2));
      console.log('Response:', result);
      console.log('='.repeat(60));
      
      setSuccessMessage(result.message || 'Configuration saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      setSaving(false);
      return true;
    } catch (err) {
      console.error(`Error saving ${section}:`, err);
      setError(err.message);
      setSaving(false);
      return false;
    }
  };

  const handleSaveGeneralPolicies = async () => {
    console.log('💾 Saving General Policies...');
    console.log('Data to save:', generalPolicies);
    await saveConfiguration('general-policies', generalPolicies);
  };

  const handleSaveWorkingHours = async () => {
    console.log('💾 Saving Working Hours...');
    console.log('Data to save:', workingHours);
    await saveConfiguration('working-hours', workingHours);
  };

  const handleSaveAcademicCalendar = async () => {
    console.log('💾 Saving Academic Calendar...');
    console.log('Data to save:', academicCalendar);
    await saveConfiguration('academic-calendar', academicCalendar);
  };

  const handleSaveConstraintRules = async () => {
    console.log('💾 Saving Constraint Rules...');
    console.log('Data to save:', constraintRules);
    await saveConfiguration('constraint-rules', constraintRules);
  };

  const handleBack = () => {
    navigate('/programs-data');
  };

  const handleNext = () => {
    navigate('/generate-timetable');
  };

  const handleAddHoliday = async () => {
    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      const newHoliday = {
        ...holidayForm,
        id: `HOL${String(holidays.length + 1).padStart(3, '0')}`
      };

      const response = await fetch(`${API_BASE_URL}/data/holidays`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newHoliday)
      });

      if (!response.ok) {
        throw new Error('Failed to add holiday');
      }

      const result = await response.json();
      if (result.success) {
        setHolidays([...holidays, result.data]);
        
        // Log added holiday
        console.log('='.repeat(60));
        console.log('✅ HOLIDAY ADDED SUCCESSFULLY');
        console.log('='.repeat(60));
        console.log('New Holiday:', JSON.stringify(result.data, null, 2));
        console.log('Total Holidays:', holidays.length + 1);
        console.log('='.repeat(60));
        
        setSuccessMessage('Holiday added successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        resetHolidayForm();
        setShowAddForm(false);
      }
      setSaving(false);
    } catch (err) {
      console.error('Error adding holiday:', err);
      setError(err.message);
      setSaving(false);
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    try {
      setError(null);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/data/holidays/${holidayId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete holiday');
      }

      const result = await response.json();
      if (result.success) {
        setHolidays(holidays.filter(h => h.id !== holidayId));
        
        // Log deleted holiday
        console.log('='.repeat(60));
        console.log('🗑️  HOLIDAY DELETED');
        console.log('='.repeat(60));
        console.log('Deleted Holiday ID:', holidayId);
        console.log('Remaining Holidays:', holidays.length - 1);
        console.log('='.repeat(60));
        
        setSuccessMessage('Holiday deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error deleting holiday:', err);
      setError(err.message);
    }
  };

  const resetHolidayForm = () => {
    setHolidayForm({
      name: '',
      date: '',
      startDate: '',
      endDate: '',
      type: 'National Holiday',
      recurring: false,
      description: '',
      isDateRange: false
    });
  };

  const handlePolicyChange = (key, value) => {
    setGeneralPolicies(prev => ({ ...prev, [key]: value }));
  };

  const handleWorkingHoursChange = (key, value) => {
    setWorkingHours(prev => ({ ...prev, [key]: value }));
  };

  const handleCalendarChange = (key, value) => {
    setAcademicCalendar(prev => ({ ...prev, [key]: value }));
  };

  const handleConstraintChange = (key, value) => {
    setConstraintRules(prev => ({ ...prev, [key]: value }));
  };

  const renderHolidayForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Holiday/Event</h3>
          <button
            onClick={() => {
              setShowAddForm(false);
              resetHolidayForm();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Name</label>
            <input
              type="text"
              value={holidayForm.name}
              onChange={(e) => setHolidayForm({...holidayForm, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Independence Day"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Type</label>
            <select
              value={holidayForm.type}
              onChange={(e) => setHolidayForm({...holidayForm, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {holidayTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDateRange"
              checked={holidayForm.isDateRange}
              onChange={(e) => setHolidayForm({...holidayForm, isDateRange: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isDateRange" className="text-sm text-gray-700 dark:text-gray-300">
              This is a date range (e.g., exam week)
            </label>
          </div>

          {holidayForm.isDateRange ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={holidayForm.startDate}
                  onChange={(e) => setHolidayForm({...holidayForm, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={holidayForm.endDate}
                  onChange={(e) => setHolidayForm({...holidayForm, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={holidayForm.date}
                onChange={(e) => setHolidayForm({...holidayForm, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recurring"
              checked={holidayForm.recurring}
              onChange={(e) => setHolidayForm({...holidayForm, recurring: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="recurring" className="text-sm text-gray-700 dark:text-gray-300">
              Recurring annually
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={holidayForm.description}
              onChange={(e) => setHolidayForm({...holidayForm, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Brief description of the event"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
          <button
            onClick={() => {
              setShowAddForm(false);
              resetHolidayForm();
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAddHoliday}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Add Event</span>
          </button>
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
              <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Infrastructure & Policies</h1>
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

      {/* Main Content with Sidebar */}
      <div className="w-full flex pt-0">
        {/* Left Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxHeight: 'calc(100vh - 4rem)', overflow: 'auto' }}>
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading configuration...</p>
            </div>
          </div>
        ) : (
          <>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">System Configuration</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure general policies, working hours, academic calendar, and holidays for optimal timetable generation
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Daily Hours</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{generalPolicies.maxDailyHours}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Break Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{generalPolicies.minBreakBetweenSessions}m</p>
              </div>
              <Coffee className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Holidays</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{holidays.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Academic Weeks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{academicCalendar.totalWeeks}</p>
              </div>
              <School className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('policies')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'policies'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                General Policies
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'schedule'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Working Hours
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'calendar'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Academic Calendar
              </button>
              <button
                onClick={() => setActiveTab('holidays')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'holidays'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Holidays & Events
              </button>
              <button
                onClick={() => setActiveTab('constraints')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'constraints'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Advanced Constraints
              </button>
            </nav>
          </div>

          {/* General Policies Tab */}
          {activeTab === 'policies' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">General Timetable Policies</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maximum Consecutive Hours
                    </label>
                    <input
                      type="number"
                      value={generalPolicies.maxConsecutiveHours}
                      onChange={(e) => handlePolicyChange('maxConsecutiveHours', parseInt(e.target.value))}
                      min="1"
                      max="6"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maximum Daily Hours
                    </label>
                    <input
                      type="number"
                      value={generalPolicies.maxDailyHours}
                      onChange={(e) => handlePolicyChange('maxDailyHours', parseInt(e.target.value))}
                      min="4"
                      max="12"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Min Break Between Sessions (minutes)
                    </label>
                    <input
                      type="number"
                      value={generalPolicies.minBreakBetweenSessions}
                      onChange={(e) => handlePolicyChange('minBreakBetweenSessions', parseInt(e.target.value))}
                      min="5"
                      max="30"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preferred Classroom Utilization (%)
                    </label>
                    <input
                      type="number"
                      value={generalPolicies.preferredClassroomUtilization}
                      onChange={(e) => handlePolicyChange('preferredClassroomUtilization', parseInt(e.target.value))}
                      min="60"
                      max="95"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maximum Students Per Class
                    </label>
                    <input
                      type="number"
                      value={generalPolicies.maxStudentsPerClass}
                      onChange={(e) => handlePolicyChange('maxStudentsPerClass', parseInt(e.target.value))}
                      min="20"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Room Capacity Buffer (%)
                    </label>
                    <input
                      type="number"
                      value={generalPolicies.minRoomCapacityBuffer}
                      onChange={(e) => handlePolicyChange('minRoomCapacityBuffer', parseInt(e.target.value))}
                      min="5"
                      max="25"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowBackToBackLabs"
                      checked={generalPolicies.allowBackToBackLabs}
                      onChange={(e) => handlePolicyChange('allowBackToBackLabs', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="allowBackToBackLabs" className="text-sm text-gray-700 dark:text-gray-300">
                      Allow back-to-back laboratory sessions
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="prioritizeTeacherPreferences"
                      checked={generalPolicies.prioritizeTeacherPreferences}
                      onChange={(e) => handlePolicyChange('prioritizeTeacherPreferences', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="prioritizeTeacherPreferences" className="text-sm text-gray-700 dark:text-gray-300">
                      Prioritize teacher availability preferences
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowSplitSessions"
                      checked={generalPolicies.allowSplitSessions}
                      onChange={(e) => handlePolicyChange('allowSplitSessions', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="allowSplitSessions" className="text-sm text-gray-700 dark:text-gray-300">
                      Allow split course sessions across different days
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowOverlappingLabs"
                      checked={generalPolicies.allowOverlappingLabs}
                      onChange={(e) => handlePolicyChange('allowOverlappingLabs', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="allowOverlappingLabs" className="text-sm text-gray-700 dark:text-gray-300">
                      Allow overlapping lab sessions for different batches
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="prioritizeCoreBefore"
                      checked={generalPolicies.prioritizeCoreBefore}
                      onChange={(e) => handlePolicyChange('prioritizeCoreBefore', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="prioritizeCoreBefore" className="text-sm text-gray-700 dark:text-gray-300">
                      Schedule core subjects before electives
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="avoidFirstLastPeriod"
                      checked={generalPolicies.avoidFirstLastPeriod}
                      onChange={(e) => handlePolicyChange('avoidFirstLastPeriod', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="avoidFirstLastPeriod" className="text-sm text-gray-700 dark:text-gray-300">
                      Avoid scheduling in first and last periods when possible
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requireLabAssistant"
                      checked={generalPolicies.requireLabAssistant}
                      onChange={(e) => handlePolicyChange('requireLabAssistant', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="requireLabAssistant" className="text-sm text-gray-700 dark:text-gray-300">
                      Require lab assistant availability for lab sessions
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveGeneralPolicies}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Policies'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Working Hours Tab */}
          {activeTab === 'schedule' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Working Hours Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Daily Schedule</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={workingHours.startTime}
                        onChange={(e) => handleWorkingHoursChange('startTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Time</label>
                      <input
                        type="time"
                        value={workingHours.endTime}
                        onChange={(e) => handleWorkingHoursChange('endTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lunch Start</label>
                      <input
                        type="time"
                        value={workingHours.lunchBreakStart}
                        onChange={(e) => handleWorkingHoursChange('lunchBreakStart', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lunch End</label>
                      <input
                        type="time"
                        value={workingHours.lunchBreakEnd}
                        onChange={(e) => handleWorkingHoursChange('lunchBreakEnd', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Period Duration (min)</label>
                      <input
                        type="number"
                        value={workingHours.periodDuration}
                        onChange={(e) => handleWorkingHoursChange('periodDuration', parseInt(e.target.value))}
                        min="30"
                        max="90"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Break Duration (min)</label>
                      <input
                        type="number"
                        value={workingHours.breakDuration}
                        onChange={(e) => handleWorkingHoursChange('breakDuration', parseInt(e.target.value))}
                        min="5"
                        max="20"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lab Duration (min)</label>
                      <input
                        type="number"
                        value={workingHours.labPeriodDuration}
                        onChange={(e) => handleWorkingHoursChange('labPeriodDuration', parseInt(e.target.value))}
                        min="90"
                        max="180"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Periods Per Day</label>
                      <input
                        type="number"
                        value={workingHours.maxPeriodsPerDay}
                        onChange={(e) => handleWorkingHoursChange('maxPeriodsPerDay', parseInt(e.target.value))}
                        min="6"
                        max="10"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Working Days</label>
                      <select
                        multiple
                        value={workingHours.workingDays}
                        onChange={(e) => {
                          const selectedDays = Array.from(e.target.selectedOptions, option => option.value);
                          handleWorkingHoursChange('workingDays', selectedDays);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Current Schedule Preview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Working Hours:</span>
                      <span className="text-gray-900 dark:text-white">{workingHours.startTime} - {workingHours.endTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Lunch Break:</span>
                      <span className="text-gray-900 dark:text-white">{workingHours.lunchBreakStart} - {workingHours.lunchBreakEnd}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Theory Period:</span>
                      <span className="text-gray-900 dark:text-white">{workingHours.periodDuration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Break Duration:</span>
                      <span className="text-gray-900 dark:text-white">{workingHours.breakDuration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Lab Duration:</span>
                      <span className="text-gray-900 dark:text-white">{workingHours.labPeriodDuration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Max Periods/Day:</span>
                      <span className="text-gray-900 dark:text-white">{workingHours.maxPeriodsPerDay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Working Days:</span>
                      <span className="text-gray-900 dark:text-white">{workingHours.workingDays.length} days</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveWorkingHours}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Working Hours'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Academic Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Academic Calendar Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Academic Year Start
                    </label>
                    <input
                      type="date"
                      value={academicCalendar.academicYearStart}
                      onChange={(e) => handleCalendarChange('academicYearStart', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Academic Year End
                    </label>
                    <input
                      type="date"
                      value={academicCalendar.academicYearEnd}
                      onChange={(e) => handleCalendarChange('academicYearEnd', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Semester 1 Start
                    </label>
                    <input
                      type="date"
                      value={academicCalendar.semester1Start}
                      onChange={(e) => handleCalendarChange('semester1Start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Semester 1 End
                    </label>
                    <input
                      type="date"
                      value={academicCalendar.semester1End}
                      onChange={(e) => handleCalendarChange('semester1End', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Semester 2 Start
                    </label>
                    <input
                      type="date"
                      value={academicCalendar.semester2Start}
                      onChange={(e) => handleCalendarChange('semester2Start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Semester 2 End
                    </label>
                    <input
                      type="date"
                      value={academicCalendar.semester2End}
                      onChange={(e) => handleCalendarChange('semester2End', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Total Teaching Weeks
                    </label>
                    <input
                      type="number"
                      value={academicCalendar.totalWeeks}
                      onChange={(e) => handleCalendarChange('totalWeeks', parseInt(e.target.value))}
                      min="12"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Examination Weeks
                    </label>
                    <input
                      type="number"
                      value={academicCalendar.examWeeks}
                      onChange={(e) => handleCalendarChange('examWeeks', parseInt(e.target.value))}
                      min="1"
                      max="4"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveAcademicCalendar}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Calendar'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Holidays Tab */}
          {activeTab === 'holidays' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Holidays & Academic Events</h3>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Holiday/Event</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {holidays.map((holiday) => (
                  <div key={holiday.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{holiday.name}</h4>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleDeleteHoliday(holiday.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {holiday.date || `${holiday.startDate} to ${holiday.endDate}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          holiday.type === 'National Holiday' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : holiday.type === 'Festival'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : holiday.type === 'Examination'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {holiday.type}
                        </span>
                        {holiday.recurring && (
                          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Recurring
                          </span>
                        )}
                      </div>
                      {holiday.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">{holiday.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Constraints Tab */}
          {activeTab === 'constraints' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Advanced Scheduling Constraints</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minimum Gap Between Exams (days)
                    </label>
                    <input
                      type="number"
                      value={constraintRules.minGapBetweenExams}
                      onChange={(e) => handleConstraintChange('minGapBetweenExams', parseInt(e.target.value))}
                      min="1"
                      max="7"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maximum Subjects Per Day
                    </label>
                    <input
                      type="number"
                      value={constraintRules.maxSubjectsPerDay}
                      onChange={(e) => handleConstraintChange('maxSubjectsPerDay', parseInt(e.target.value))}
                      min="4"
                      max="8"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="preferMorningLabs"
                      checked={constraintRules.preferMorningLabs}
                      onChange={(e) => handleConstraintChange('preferMorningLabs', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="preferMorningLabs" className="text-sm text-gray-700 dark:text-gray-300">
                      Prefer scheduling labs in morning hours
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="avoidFridayAfternoon"
                      checked={constraintRules.avoidFridayAfternoon}
                      onChange={(e) => handleConstraintChange('avoidFridayAfternoon', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="avoidFridayAfternoon" className="text-sm text-gray-700 dark:text-gray-300">
                      Avoid Friday afternoon scheduling when possible
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="balanceWorkload"
                      checked={constraintRules.balanceWorkload}
                      onChange={(e) => handleConstraintChange('balanceWorkload', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="balanceWorkload" className="text-sm text-gray-700 dark:text-gray-300">
                      Balance daily workload across the week
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="groupSimilarSubjects"
                      checked={constraintRules.groupSimilarSubjects}
                      onChange={(e) => handleConstraintChange('groupSimilarSubjects', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="groupSimilarSubjects" className="text-sm text-gray-700 dark:text-gray-300">
                      Group similar subjects on same day
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="maintainTeacherContinuity"
                      checked={constraintRules.maintainTeacherContinuity}
                      onChange={(e) => handleConstraintChange('maintainTeacherContinuity', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="maintainTeacherContinuity" className="text-sm text-gray-700 dark:text-gray-300">
                      Maintain teacher continuity in sequential periods
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="prioritizePopularSlots"
                      checked={constraintRules.prioritizePopularSlots}
                      onChange={(e) => handleConstraintChange('prioritizePopularSlots', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="prioritizePopularSlots" className="text-sm text-gray-700 dark:text-gray-300">
                      Prioritize popular time slots for core subjects
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Constraint Summary</h4>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <p>• Active constraints will be considered during timetable generation</p>
                  <p>• These rules help optimize the schedule for better learning outcomes</p>
                  <p>• Conflicts between constraints will be resolved based on priority</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveConstraintRules}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Constraints'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button 
            onClick={handleBack}
            className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back: Programs & Courses
          </button>
          
          <button 
            onClick={handleNext}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Generate Timetable
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
        </>
        )}
          </div>
        </main>
      </div>

      {/* Add Holiday Form */}
      {showAddForm && renderHolidayForm()}
    </div>
  );
};

export default InfrastructureData;
