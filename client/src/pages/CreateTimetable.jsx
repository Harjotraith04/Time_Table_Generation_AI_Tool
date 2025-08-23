import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { 
  Calendar, 
  Users, 
  Building2, 
  BookOpen, 
  Settings,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  GraduationCap,
  Upload,
  FileText,
  Database
} from 'lucide-react';

const CreateTimetable = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [timetableData, setTimetableData] = useState({
    year: '',
    semester: '',
    academicYear: '',
    department: ''
  });

  const steps = [
    { id: 1, title: 'Basic Information', icon: FileText },
    { id: 2, title: 'Teachers Data', icon: Users },
    { id: 3, title: 'Students Data', icon: GraduationCap },
    { id: 4, title: 'Classrooms & Labs', icon: Building2 },
    { id: 5, title: 'Programs & Courses', icon: BookOpen },
    { id: 6, title: 'Infrastructure & Policy', icon: Settings }
  ];

  const dataCategories = [
    {
      id: 'teachers',
      title: 'Teachers Data',
      description: 'Manage teacher profiles, subjects, and availability',
      icon: Users,
      color: 'blue',
      route: '/teachers-data',
      status: 'pending',
      items: ['Teacher Profiles', 'Subject Assignments', 'Availability & Priority', 'Teaching Hours per Week']
    },
    {
      id: 'students',
      title: 'Students Data',
      description: 'Manage student profiles, enrollment, and academic information',
      icon: GraduationCap,
      color: 'indigo',
      route: '/student-management',
      status: 'pending',
      items: ['Student Profiles', 'Academic Information', 'Division & Batch Assignment', 'Course Enrollment']
    },
    {
      id: 'classrooms',
      title: 'Classrooms & Labs',
      description: 'Configure room details and capacity',
      icon: Building2,
      color: 'green',
      route: '/classrooms-data',
      status: 'pending',
      items: ['Room Details (ID, Building, Floor)', 'Capacity', 'Type (Lecture, Lab, Computer)', 'Total Room Count']
    },
    {
      id: 'programs',
      title: 'Programs, Courses & Batches',
      description: 'Set up academic programs and course structure',
      icon: BookOpen,
      color: 'purple',
      route: '/programs-data',
      status: 'pending',
      items: ['School/Faculty Selection', 'Courses per School', 'Divisions & Student Count', 'Lab Batches']
    },
    {
      id: 'infrastructure',
      title: 'Infrastructure & Policy',
      description: 'Define policies and academic calendar',
      icon: Settings,
      color: 'orange',
      route: '/infrastructure-data',
      status: 'pending',
      items: ['General Policies', 'Working Hours & Break Timings', 'Academic Calendar', 'Holidays & Exams']
    }
  ];

  const handleBack = () => {
    navigate('/admin-dashboard');
  };

  const handleDataCategoryClick = (route) => {
    navigate(route);
  };

  const handleBasicInfoSubmit = () => {
    setCurrentStep(2);
  };

  const renderBasicInformation = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Timetable</h2>
        <p className="text-gray-600">Enter the basic information for your timetable generation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
          <select 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={timetableData.academicYear}
            onChange={(e) => setTimetableData({...timetableData, academicYear: e.target.value})}
          >
            <option value="">Select Academic Year</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2026-2027">2026-2027</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department/School</label>
          <select 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={timetableData.department}
            onChange={(e) => setTimetableData({...timetableData, department: e.target.value})}
          >
            <option value="">Select Department</option>
            <option value="engineering">Engineering</option>
            <option value="computer-science">Computer Science</option>
            <option value="business">Business Administration</option>
            <option value="medical">Medical Sciences</option>
            <option value="law">Law</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
          <select 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={timetableData.year}
            onChange={(e) => setTimetableData({...timetableData, year: e.target.value})}
          >
            <option value="">Select Year</option>
            <option value="1">First Year</option>
            <option value="2">Second Year</option>
            <option value="3">Third Year</option>
            <option value="4">Fourth Year</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
          <select 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={timetableData.semester}
            onChange={(e) => setTimetableData({...timetableData, semester: e.target.value})}
          >
            <option value="">Select Semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between">
        <button 
          onClick={handleBack}
          className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        <button 
          onClick={handleBasicInfoSubmit}
          disabled={!timetableData.academicYear || !timetableData.department || !timetableData.year || !timetableData.semester}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );

  const renderDataManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Management</h2>
          <p className="text-gray-600">Configure all required data for timetable generation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dataCategories.map((category) => (
            <div 
              key={category.id}
              onClick={() => handleDataCategoryClick(category.route)}
              className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-blue-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${category.color}-100 group-hover:bg-${category.color}-200 transition-colors`}>
                  <category.icon className={`w-6 h-6 text-${category.color}-600`} />
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.status === 'completed' ? 'bg-green-100 text-green-800' :
                    category.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {category.status === 'completed' ? 'Completed' :
                     category.status === 'in-progress' ? 'In Progress' : 'Pending'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {category.title}
              </h3>
              <p className="text-gray-600 mb-4">{category.description}</p>

              <div className="space-y-2">
                {category.items.map((item, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-500">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Data Requirements</h4>
              <p className="text-blue-700 text-sm">
                All data categories must be configured before you can generate a timetable. 
                You can upload CSV files or fill forms manually for each category.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button 
            onClick={() => setCurrentStep(1)}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Basic Info
          </button>
          <button 
            onClick={() => navigate('/generate-timetable')}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            <Database className="w-4 h-4 mr-2" />
            Generate Timetable
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
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Timetable Generator</h1>
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

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500' 
                    : 'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 1 ? renderBasicInformation() : renderDataManagement()}
      </div>
    </div>
  );
};

export default CreateTimetable;
