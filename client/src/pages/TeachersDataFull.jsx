import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../services/api';
import { 
  Calendar, 
  Users, 
  ArrowLeft,
  ArrowRight,
  Plus,
  Upload,
  Download,
  Edit2,
  Trash2,
  Save,
  X,
  Clock,
  BookOpen,
  CheckCircle,
  Star,
  School,
  FileText,
  Loader
} from 'lucide-react';

const TeachersData = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectDetails, setSubjectDetails] = useState({
    hasLab: false,
    hasTutorial: false
  });
  const [uploadMethod, setUploadMethod] = useState('form'); // 'form' or 'csv'
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch teachers from API on component mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTeachers();
      setTeachers(response.data || response.teachers || []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Failed to load teachers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    employeeId: '',
    department: '',
    designation: '',
    subjects: [], // Array of objects: {name: 'Subject Name', hasLab: false, hasTutorial: false}
    hoursPerWeek: '',
    email: '',
    phone: '',
    priority: 'Core',
    availability: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: []
    }
  });

  const departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering', 'Business'];
  const designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Visiting Faculty'];
  const subjectsList = [
    'Data Structures', 'Algorithms', 'Database Systems', 'Machine Learning', 'Software Engineering',
    'Web Development', 'Computer Networks', 'Operating Systems', 'Linear Algebra', 'Calculus',
    'Statistics', 'Probability', 'Physics I', 'Physics II', 'Chemistry I', 'Chemistry II',
    'Biology I', 'Biology II', 'Business Management', 'Accounting', 'Marketing', 'Finance'
  ];
  const timeSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];
  const priorities = ['Core', 'Visiting'];

  const handleBack = () => {
    navigate('/create-timetable');
  };

  const handleNext = () => {
    navigate('/classrooms-data');
  };

  const handleAddTeacher = async () => {
    try {
      setLoading(true);
      await createTeacher(teacherForm);
      await fetchTeachers(); // Reload teachers from API
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding teacher:', err);
      alert('Failed to add teacher. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeacher = (teacher) => {
    setTeacherForm(teacher);
    setEditingTeacher(teacher._id || teacher.id);
    setShowAddForm(true);
  };

  const handleUpdateTeacher = async () => {
    try {
      setLoading(true);
      await updateTeacher(editingTeacher, teacherForm);
      await fetchTeachers(); // Reload teachers from API
      resetForm();
      setShowAddForm(false);
      setEditingTeacher(null);
    } catch (err) {
      console.error('Error updating teacher:', err);
      alert('Failed to update teacher. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      setLoading(true);
      await deleteTeacher(teacherId);
      await fetchTeachers(); // Reload teachers from API
    } catch (err) {
      console.error('Error deleting teacher:', err);
      alert('Failed to delete teacher. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTeacherForm({
      name: '',
      employeeId: '',
      department: '',
      designation: '',
      subjects: [],
      hoursPerWeek: '',
      email: '',
      phone: '',
      priority: 'Core',
      availability: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: []
      }
    });
  };

  const handleSubjectToggle = (subject) => {
    const currentSubjects = teacherForm.subjects || [];
    const existingSubject = currentSubjects.find(s => s.name === subject);
    
    if (existingSubject) {
      // Remove subject if already selected
      setTeacherForm({
        ...teacherForm,
        subjects: currentSubjects.filter(s => s.name !== subject)
      });
    } else {
      // Show modal to get lab/tutorial details for new subject
      setSelectedSubject(subject);
      setSubjectDetails({
        hasLab: false,
        hasTutorial: false
      });
      setShowSubjectModal(true);
    }
  };

  const handleSubjectDetailsConfirm = () => {
    const currentSubjects = teacherForm.subjects || [];
    const newSubject = {
      name: selectedSubject,
      hasLab: subjectDetails.hasLab,
      hasTutorial: subjectDetails.hasTutorial
    };
    
    setTeacherForm({
      ...teacherForm,
      subjects: [...currentSubjects, newSubject]
    });
    
    setShowSubjectModal(false);
    setSelectedSubject('');
    setSubjectDetails({
      hasLab: false,
      hasTutorial: false
    });
  };

  const handleSubjectDetailsCancel = () => {
    setShowSubjectModal(false);
    setSelectedSubject('');
    setSubjectDetails({
      hasLab: false,
      hasTutorial: false
    });
  };

  const handleAvailabilityToggle = (day, timeSlot) => {
    const currentSlots = teacherForm.availability[day] || [];
    if (currentSlots.includes(timeSlot)) {
      setTeacherForm({
        ...teacherForm,
        availability: {
          ...teacherForm.availability,
          [day]: currentSlots.filter(slot => slot !== timeSlot)
        }
      });
    } else {
      setTeacherForm({
        ...teacherForm,
        availability: {
          ...teacherForm.availability,
          [day]: [...currentSlots, timeSlot]
        }
      });
    }
  };

  const renderTeacherForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
          </h3>
          <button
            onClick={() => {
              setShowAddForm(false);
              setEditingTeacher(null);
              resetForm();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Dr. John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee ID</label>
                <input
                  type="text"
                  value={teacherForm.employeeId}
                  onChange={(e) => setTeacherForm({...teacherForm, employeeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="EMP001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
                <select
                  value={teacherForm.department}
                  onChange={(e) => setTeacherForm({...teacherForm, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Designation</label>
                <select
                  value={teacherForm.designation}
                  onChange={(e) => setTeacherForm({...teacherForm, designation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Designation</option>
                  {designations.map(designation => (
                    <option key={designation} value={designation}>{designation}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="john.smith@university.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={teacherForm.phone}
                  onChange={(e) => setTeacherForm({...teacherForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="+1-234-567-8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                <select
                  value={teacherForm.priority}
                  onChange={(e) => setTeacherForm({...teacherForm, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hours per Week</label>
                <input
                  type="number"
                  value={teacherForm.hoursPerWeek}
                  onChange={(e) => setTeacherForm({...teacherForm, hoursPerWeek: parseInt(e.target.value) || ''})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="18"
                  min="1"
                  max="40"
                />
              </div>
            </div>
          </div>

          {/* Subject Assignments */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subject Assignments</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectsList.map(subject => {
                const isSelected = teacherForm.subjects?.some(s => s.name === subject) || false;
                const subjectInfo = teacherForm.subjects?.find(s => s.name === subject);
                
                return (
                  <div key={subject} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <label className="flex items-center space-x-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSubjectToggle(subject)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{subject}</span>
                    </label>
                    {isSelected && subjectInfo && (
                      <div className="flex items-center space-x-1 ml-2">
                        {subjectInfo.hasLab && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                            Lab
                          </span>
                        )}
                        {subjectInfo.hasTutorial && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                            Tutorial
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Availability */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Availability</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Day
                    </th>
                    {timeSlots.map(slot => (
                      <th key={slot} className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {slot}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.keys(teacherForm.availability).map(day => (
                    <tr key={day}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {day}
                      </td>
                      {timeSlots.map(slot => (
                        <td key={`${day}-${slot}`} className="px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={teacherForm.availability[day]?.includes(slot) || false}
                            onChange={() => handleAvailabilityToggle(day, slot)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
          <button
            onClick={() => {
              setShowAddForm(false);
              setEditingTeacher(null);
              resetForm();
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={editingTeacher ? handleUpdateTeacher : handleAddTeacher}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{editingTeacher ? 'Update' : 'Add'} Teacher</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Subject Details Modal
  const renderSubjectModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Subject Details: {selectedSubject}
          </h3>
          <button
            onClick={handleSubjectDetailsCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please specify the session types for this subject:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Laboratory Sessions
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Does this subject include practical lab work?
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSubjectDetails({...subjectDetails, hasLab: false})}
                  className={`px-3 py-1 text-sm rounded ${
                    !subjectDetails.hasLab 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  No
                </button>
                <button
                  onClick={() => setSubjectDetails({...subjectDetails, hasLab: true})}
                  className={`px-3 py-1 text-sm rounded ${
                    subjectDetails.hasLab 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tutorial Sessions
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Does this subject include tutorial sessions?
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSubjectDetails({...subjectDetails, hasTutorial: false})}
                  className={`px-3 py-1 text-sm rounded ${
                    !subjectDetails.hasTutorial 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  No
                </button>
                <button
                  onClick={() => setSubjectDetails({...subjectDetails, hasTutorial: true})}
                  className={`px-3 py-1 text-sm rounded ${
                    subjectDetails.hasTutorial 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
          <button
            onClick={handleSubjectDetailsCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubjectDetailsConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Add Subject</span>
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
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Teachers Data</h1>
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Teachers Management</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage teacher profiles, subjects, and availability for timetable generation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setUploadMethod('csv')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Upload className="w-4 h-4" />
                <span>Import CSV</span>
              </button>
              <button 
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Teachers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{teachers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Core Faculty</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {teachers.filter(t => t.priority === 'Core').length}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Departments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(teachers.map(t => t.department)).size}
                </p>
              </div>
              <School className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Hours/Week</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(teachers.reduce((sum, t) => sum + t.hoursPerWeek, 0) / teachers.length)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Teachers List</h3>
              <button
                onClick={() => setShowAddForm(true)}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Add Teacher</span>
              </button>
            </div>
          </div>
          
          {/* Loading State */}
          {loading && teachers.length === 0 && (
            <div className="p-12 text-center">
              <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading teachers...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-12 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchTeachers}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && teachers.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No teachers found. Add your first teacher to get started.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Teacher
              </button>
            </div>
          )}

          {/* Data Table */}
          {!loading && !error && teachers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Teacher Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Department & Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Subjects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hours/Week
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{teacher.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{teacher.employeeId}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{teacher.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{teacher.department}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{teacher.designation}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.slice(0, 2).map((subject, index) => (
                          <div key={index} className="flex items-center space-x-1">
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                              {subject.name || subject}
                            </span>
                            {(subject.hasLab || subject.hasTutorial) && (
                              <div className="flex space-x-1">
                                {subject.hasLab && (
                                  <span className="px-1 py-0.5 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                                    L
                                  </span>
                                )}
                                {subject.hasTutorial && (
                                  <span className="px-1 py-0.5 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded">
                                    T
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {teacher.subjects.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                            +{teacher.subjects.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {teacher.hoursPerWeek}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${
                        teacher.priority === 'Core' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {teacher.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditTeacher(teacher)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(teacher._id || teacher.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            Back to Overview
          </button>
          
          <button 
            onClick={handleNext}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Next: Classrooms & Labs
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && renderTeacherForm()}
      
      {/* Subject Details Modal */}
      {showSubjectModal && renderSubjectModal()}
    </div>
  );
};

export default TeachersData;
