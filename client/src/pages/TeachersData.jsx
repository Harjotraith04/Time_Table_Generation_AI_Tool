import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
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
  AlertCircle,
  User,
  Mail,
  Phone,
  GraduationCap
} from 'lucide-react';

const TeachersData = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  
  const [teacherForm, setTeacherForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    qualification: '',
    experience: '',
    subjects: [],
    maxHoursPerWeek: '',
    availability: {
      monday: { available: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
      thursday: { available: true, startTime: '09:00', endTime: '17:00' },
      friday: { available: true, startTime: '09:00', endTime: '17:00' },
      saturday: { available: false, startTime: '09:00', endTime: '13:00' },
      sunday: { available: false, startTime: '09:00', endTime: '13:00' }
    },
    priority: 'medium'
  });

  const [teachers, setTeachers] = useState([
    {
      id: 'T001',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      phone: '+1-555-0123',
      department: 'Computer Science',
      designation: 'Professor',
      qualification: 'Ph.D. Computer Science',
      experience: '12 years',
      subjects: ['Data Structures', 'Algorithms', 'Machine Learning'],
      maxHoursPerWeek: '20',
      priority: 'high',
      status: 'active'
    },
    {
      id: 'T002',
      name: 'Prof. Michael Chen',
      email: 'michael.chen@university.edu',
      phone: '+1-555-0124',
      department: 'Computer Science',
      designation: 'Associate Professor',
      qualification: 'Ph.D. Software Engineering',
      experience: '8 years',
      subjects: ['Software Engineering', 'Database Systems', 'Web Development'],
      maxHoursPerWeek: '18',
      priority: 'high',
      status: 'active'
    },
    {
      id: 'T003',
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@university.edu',
      phone: '+1-555-0125',
      department: 'Mathematics',
      designation: 'Assistant Professor',
      qualification: 'Ph.D. Applied Mathematics',
      experience: '5 years',
      subjects: ['Calculus', 'Linear Algebra', 'Statistics'],
      maxHoursPerWeek: '16',
      priority: 'medium',
      status: 'active'
    }
  ]);

  const departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering'];
  const designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Teaching Assistant'];
  const subjectsList = [
    'Data Structures', 'Algorithms', 'Machine Learning', 'Software Engineering', 
    'Database Systems', 'Web Development', 'Computer Networks', 'Operating Systems',
    'Calculus', 'Linear Algebra', 'Statistics', 'Discrete Mathematics',
    'Physics I', 'Physics II', 'Quantum Physics', 'Thermodynamics',
    'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry',
    'Cell Biology', 'Genetics', 'Ecology', 'Microbiology'
  ];

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleBack = () => {
    navigate('/create-timetable');
  };

  const handleAddTeacher = () => {
    setShowAddForm(true);
    setEditingTeacher(null);
    setTeacherForm({
      id: `T${String(teachers.length + 1).padStart(3, '0')}`,
      name: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      qualification: '',
      experience: '',
      subjects: [],
      maxHoursPerWeek: '',
      availability: {
        monday: { available: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
        thursday: { available: true, startTime: '09:00', endTime: '17:00' },
        friday: { available: true, startTime: '09:00', endTime: '17:00' },
        saturday: { available: false, startTime: '09:00', endTime: '13:00' },
        sunday: { available: false, startTime: '09:00', endTime: '13:00' }
      },
      priority: 'medium'
    });
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher.id);
    setTeacherForm(teacher);
    setShowAddForm(true);
  };

  const handleDeleteTeacher = (teacherId) => {
    setTeachers(teachers.filter(t => t.id !== teacherId));
  };

  const handleSaveTeacher = () => {
    if (editingTeacher) {
      setTeachers(teachers.map(t => t.id === editingTeacher ? teacherForm : t));
    } else {
      setTeachers([...teachers, { ...teacherForm, status: 'active' }]);
    }
    setShowAddForm(false);
    setEditingTeacher(null);
  };

  const handleSubjectToggle = (subject) => {
    const currentSubjects = teacherForm.subjects || [];
    if (currentSubjects.includes(subject)) {
      setTeacherForm({
        ...teacherForm,
        subjects: currentSubjects.filter(s => s !== subject)
      });
    } else {
      setTeacherForm({
        ...teacherForm,
        subjects: [...currentSubjects, subject]
      });
    }
  };

  const handleAvailabilityChange = (day, field, value) => {
    setTeacherForm({
      ...teacherForm,
      availability: {
        ...teacherForm.availability,
        [day]: {
          ...teacherForm.availability[day],
          [field]: value
        }
      }
    });
  };

  const renderTeacherForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teacher ID</label>
                <input
                  type="text"
                  value={teacherForm.id}
                  onChange={(e) => setTeacherForm({...teacherForm, id: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="T001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Dr. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="john.doe@university.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={teacherForm.phone}
                  onChange={(e) => setTeacherForm({...teacherForm, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="+1-555-0123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
                <select
                  value={teacherForm.department}
                  onChange={(e) => setTeacherForm({...teacherForm, department: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Designation</option>
                  {designations.map(designation => (
                    <option key={designation} value={designation}>{designation}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qualification</label>
                <input
                  type="text"
                  value={teacherForm.qualification}
                  onChange={(e) => setTeacherForm({...teacherForm, qualification: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ph.D. Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience</label>
                <input
                  type="text"
                  value={teacherForm.experience}
                  onChange={(e) => setTeacherForm({...teacherForm, experience: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="5 years"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Hours per Week</label>
                <input
                  type="number"
                  value={teacherForm.maxHoursPerWeek}
                  onChange={(e) => setTeacherForm({...teacherForm, maxHoursPerWeek: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="20"
                  min="1"
                  max="40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                <select
                  value={teacherForm.priority}
                  onChange={(e) => setTeacherForm({...teacherForm, priority: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>
          </div>

          

          {/* Availability Schedule */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Availability</h4>
            <div className="space-y-3">
              {daysOfWeek.map(day => (
                <div key={day} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-20">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {day}
                    </span>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={teacherForm.availability[day]?.available || false}
                      onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
                  </label>
                  {teacherForm.availability[day]?.available && (
                    <>
                      <input
                        type="time"
                        value={teacherForm.availability[day]?.startTime || '09:00'}
                        onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                      />
                      <span className="text-gray-500 dark:text-gray-400">to</span>
                      <input
                        type="time"
                        value={teacherForm.availability[day]?.endTime || '17:00'}
                        onChange={(e) => handleAvailabilityChange(day, 'endTime', e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
          <button
            onClick={() => setShowAddForm(false)}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveTeacher}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{editingTeacher ? 'Update' : 'Save'} Teacher</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTeachersList = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Teachers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {teachers.filter(t => t.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Departments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {[...new Set(teachers.map(t => t.department))].length}
              </p>
            </div>
            <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {[...new Set(teachers.flatMap(t => t.subjects))].length}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Teachers List</h3>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                <Upload className="w-4 h-4" />
                <span>Import CSV</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button 
                onClick={handleAddTeacher}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Teacher</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subjects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hours/Week</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{teacher.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{teacher.id}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{teacher.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{teacher.department}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{teacher.designation}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.slice(0, 3).map((subject, index) => (
                        <span key={index} className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          {subject}
                        </span>
                      ))}
                      {teacher.subjects.length > 3 && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          +{teacher.subjects.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {teacher.maxHoursPerWeek} hrs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      teacher.priority === 'high' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : teacher.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {teacher.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {teacher.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleEditTeacher(teacher)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Teachers Data Management</h1>
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Teachers Data</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage teacher profiles, subjects, and availability for timetable generation
              </p>
            </div>
            <button 
              onClick={handleBack}
              className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Timetable Creation
            </button>
          </div>
        </div>

        <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Data Requirements</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Please ensure all teacher information is complete and accurate. This includes contact details, 
                subject assignments, weekly availability, and teaching hour preferences.
              </p>
            </div>
          </div>
        </div>

        {renderTeachersList()}

        <div className="mt-8 flex justify-between">
          <button 
            onClick={handleBack}
            className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <button 
            onClick={() => navigate('/classrooms-data')}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Next: Classrooms & Labs
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && renderTeacherForm()}
    </div>
  );
};

export default TeachersData;
