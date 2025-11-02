import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import AdminSidebar from '../components/AdminSidebar';
import { 
  Users, 
  Plus,
  Upload,
  Download,
  Edit2,
  Trash2,
  Search,
  Filter,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Star,
  Clock,
  Mail,
  Phone
} from 'lucide-react';

const TeachersManagement = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // State management
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'bulk', 'upload'
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    designation: '',
    status: ''
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Form data
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    qualification: '',
    experience: '',
    subjects: [],
    maxHoursPerWeek: 20,
    availability: {
      monday: { available: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
      thursday: { available: true, startTime: '09:00', endTime: '17:00' },
      friday: { available: true, startTime: '09:00', endTime: '17:00' },
      saturday: { available: false, startTime: '09:00', endTime: '13:00' },
      sunday: { available: false, startTime: '09:00', endTime: '13:00' }
    },
    priority: 'medium',
    status: 'active'
  });

  // Bulk data
  const [bulkData, setBulkData] = useState({
    sendCredentials: false
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  // Options
  const departments = [
    'Computer Science',
    'Mathematics', 
    'Physics',
    'Chemistry',
    'Biology',
    'Engineering',
    'Business',
    'Law'
  ];

  const designations = [
    'Professor',
    'Associate Professor', 
    'Assistant Professor',
    'Lecturer',
    'Teaching Assistant'
  ];

  const subjectsList = [
    'Data Structures', 'Algorithms', 'Machine Learning', 'Software Engineering',
    'Database Systems', 'Web Development', 'Computer Networks', 'Operating Systems',
    'Calculus', 'Linear Algebra', 'Statistics', 'Discrete Mathematics',
    'Physics I', 'Physics II', 'Quantum Physics', 'Thermodynamics',
    'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry',
    'Cell Biology', 'Genetics', 'Ecology', 'Microbiology'
  ];

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Fetch teachers from API
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`http://localhost:8000/api/data/teachers?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch teachers');

      const data = await response.json();
      console.log('fetchTeachers response:', data);
      setTeachers(data.data || []);
      setPagination(prev => ({ ...prev, ...(data.pagination || {}) }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchTeachers();
  }, [pagination.page, pagination.limit, searchTerm, filters]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Generate unique teacher ID
  const generateTeacherId = () => {
    const existingIds = (teachers || []).map(t => t.id).filter(id => id.startsWith('T'));
    const numbers = existingIds.map(id => parseInt(id.substring(1))).filter(num => !isNaN(num));
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `T${String(maxNumber + 1).padStart(3, '0')}`;
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      id: generateTeacherId(),
      name: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      qualification: '',
      experience: '',
      subjects: [],
      maxHoursPerWeek: 20,
      availability: {
        monday: { available: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
        thursday: { available: true, startTime: '09:00', endTime: '17:00' },
        friday: { available: true, startTime: '09:00', endTime: '17:00' },
        saturday: { available: false, startTime: '09:00', endTime: '13:00' },
        sunday: { available: false, startTime: '09:00', endTime: '13:00' }
      },
      priority: 'medium',
      status: 'active'
    });
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.id.trim()) {
        throw new Error('Teacher ID is required');
      }
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }
      if (!formData.department.trim()) {
        throw new Error('Department is required');
      }
      if (!formData.designation.trim()) {
        throw new Error('Designation is required');
      }
      if (formData.subjects.length === 0) {
        throw new Error('At least one subject is required');
      }
      if (!formData.phone || !formData.phone.trim()) {
        throw new Error('Phone number is required');
      }
      
      // Validate phone number format
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        throw new Error('Phone number must start with 1-9 and contain only digits (and optional + prefix)');
      }
      
      const endpoint = modalType === 'edit' ? 
        `http://localhost:8000/api/data/teachers/${selectedTeacher.id}` : 
        'http://localhost:8000/api/data/teachers';
      
      const method = modalType === 'edit' ? 'PUT' : 'POST';

      // Prepare data to send (only include fields expected by server)
      const dataToSend = {
        id: formData.id.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        department: formData.department.trim(),
        designation: formData.designation.trim(),
        qualification: formData.qualification?.trim() || undefined,
        experience: formData.experience?.trim() || undefined,
        subjects: formData.subjects,
        maxHoursPerWeek: parseInt(formData.maxHoursPerWeek),
        availability: formData.availability,
        priority: formData.priority,
        status: formData.status,
        phone: formData.phone.trim()
      };

      // Remove undefined fields
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === undefined) {
          delete dataToSend[key];
        }
      });

      console.log('Sending data:', dataToSend);

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response:', errorData);
        throw new Error(errorData.message || errorData.errors?.map(e => e.msg).join(', ') || 'Failed to save teacher');
      }

      const data = await response.json();
      console.log('Teacher created successfully:', data);
      setSuccess(data.message);
      setShowModal(false);
      resetForm();
      console.log('Calling fetchTeachers to refresh list...');
      fetchTeachers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk creation
  const handleBulkCreate = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data/teachers/bulk-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(bulkData)
      });

      if (!response.ok) throw new Error('Failed to create teachers');

      const data = await response.json();
      setUploadResult(data.data);
      setSuccess(data.message);
      setShowModal(false);
      fetchTeachers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!uploadFile) {
      setError('Please select a CSV file to upload');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Uploading CSV file...');
      
      const formData = new FormData();
      formData.append('csvFile', uploadFile);
      formData.append('sendCredentials', bulkData.sendCredentials);

      console.log('FormData:', {
        file: uploadFile.name,
        sendCredentials: bulkData.sendCredentials
      });

      const response = await fetch('http://localhost:8000/api/data/teachers/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }

      const data = await response.json();
      console.log('CSV upload result:', data);
      console.log('Created:', data.data?.created?.length || 0);
      console.log('Failed:', data.data?.failed?.length || 0);
      if (data.data?.failed && data.data.failed.length > 0) {
        console.log('Failed records:', JSON.stringify(data.data.failed, null, 2));
        // Show detailed failure info
        const failureDetails = data.data.failed.map(f => 
          `${f.teacherId || f.email}: ${f.reason}`
        ).join('\n');
        setError(`Some teachers failed to upload:\n${failureDetails}`);
      }
      
      setUploadResult(data.data);
      setSuccess(data.message);
      setShowModal(false);
      fetchTeachers();
    } catch (err) {
      console.error('Error uploading CSV:', err);
      setError('Failed to upload CSV: ' + err.message);
    } finally {
      setLoading(false);
      setUploadFile(null);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      );

      const response = await fetch(`http://localhost:8000/api/data/teachers/export?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to export teachers');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'teachers.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle edit
  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      id: teacher.id || '',
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      department: teacher.department || '',
      designation: teacher.designation || '',
      qualification: teacher.qualification || '',
      experience: teacher.experience || '',
      subjects: teacher.subjects || [],
      maxHoursPerWeek: teacher.maxHoursPerWeek || 20,
      availability: teacher.availability || {
        monday: { available: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
        thursday: { available: true, startTime: '09:00', endTime: '17:00' },
        friday: { available: true, startTime: '09:00', endTime: '17:00' },
        saturday: { available: false, startTime: '09:00', endTime: '13:00' },
        sunday: { available: false, startTime: '09:00', endTime: '13:00' }
      },
      priority: teacher.priority || 'medium',
      status: teacher.status || 'active'
    });
    setModalType('edit');
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (teacherId) => {
    if (!window.confirm('Are you sure you want to delete this teacher? This will also delete their user account.')) return;

    try {
      setLoading(true);
      setError('');
      
      console.log('Deleting teacher:', teacherId);
      
      const response = await fetch(`http://localhost:8000/api/data/teachers/${teacherId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete teacher');
      }

      const data = await response.json();
      console.log('Delete result:', data);
      
      setSuccess(data.message);
      fetchTeachers();
    } catch (err) {
      console.error('Error deleting teacher:', err);
      setError('Failed to delete teacher: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: teachers?.length || 0,
    coreFaculty: teachers?.filter(t => t.priority === 'high').length || 0,
    departments: teachers?.length ? new Set(teachers.map(t => t.department)).size : 0,
    avgHours: teachers?.length > 0 ? Math.round(teachers.reduce((sum, t) => sum + (t.maxHoursPerWeek || 0), 0) / teachers.length) : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teachers Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage teacher profiles, subjects, and availability for timetable generation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-gray-600 dark:text-gray-400">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-red-800 dark:text-red-300">
                <p className="font-semibold mb-2">{error.split('\n')[0]}</p>
                {error.includes('\n') && (
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {error.split('\n').slice(1).filter(line => line.trim()).map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-green-800 dark:text-green-300">{success}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setModalType('upload');
                setShowModal(true);
              }}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </button>
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
          <button
            onClick={() => {
              setModalType('add');
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Teacher
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Teachers</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Core Faculty</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.coreFaculty}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Departments</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.departments}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Hours/Week</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgHours}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={filters.designation}
              onChange={(e) => setFilters(prev => ({ ...prev, designation: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Designations</option>
              {designations.map(designation => (
                <option key={designation} value={designation}>{designation}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Teachers List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Teachers List</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading teachers...</p>
            </div>
          ) : (teachers?.length || 0) === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No teachers found. Add some teachers to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Teacher Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Department & Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Subjects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Hours/Week
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {(teachers || []).map((teacher) => (
                    <tr key={teacher._id || teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {teacher.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {teacher.id}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {teacher.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {teacher.department}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {teacher.designation}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects && teacher.subjects.slice(0, 2).map((subject, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            >
                              {typeof subject === 'string' ? subject : subject.name}
                            </span>
                          ))}
                          {teacher.subjects && teacher.subjects.length > 2 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              +{teacher.subjects.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {teacher.maxHoursPerWeek || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          teacher.priority === 'high' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          teacher.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                        }`}>
                          {teacher.priority === 'high' ? 'Core' : 
                           teacher.priority === 'medium' ? 'Regular' : 'Visiting'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
          </div>
        </main>
      </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'add' ? 'Add New Teacher' :
                   modalType === 'edit' ? 'Edit Teacher' :
                   modalType === 'upload' ? 'Upload Teachers CSV' : 'Bulk Create Teachers'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {modalType === 'upload' ? (
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload CSV File
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600">
                      <div className="space-y-1 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              accept=".csv"
                              className="sr-only"
                              onChange={(e) => setUploadFile(e.target.files[0])}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">CSV files only</p>
                      </div>
                    </div>
                  </div>

                  {uploadFile && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                        <span className="text-blue-800 dark:text-blue-300">Selected: {uploadFile.name}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sendCredentials"
                      checked={bulkData.sendCredentials}
                      onChange={(e) => setBulkData(prev => ({ ...prev, sendCredentials: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sendCredentials" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Create user accounts and generate temporary passwords
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFileUpload}
                      disabled={!uploadFile || loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Uploading...' : 'Upload & Create Teachers'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Teacher ID * {modalType === 'add' && <span className="text-xs text-gray-500">(Auto-generated)</span>}
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            required
                            value={formData.id}
                            onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                            readOnly={modalType === 'add'}
                            className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${
                              modalType === 'add' 
                                ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' 
                                : 'bg-white dark:bg-gray-700'
                            }`}
                          />
                          {modalType === 'add' && (
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, id: generateTeacherId() }))}
                              className="px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                              title="Generate new ID"
                            >
                              ↻
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="1234567890 or +1234567890"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Required. Enter digits only (1-9 first digit, optional + prefix)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Department *
                        </label>
                        <select
                          required
                          value={formData.department}
                          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select Department</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Designation *
                        </label>
                        <select
                          required
                          value={formData.designation}
                          onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select Designation</option>
                          {designations.map(designation => (
                            <option key={designation} value={designation}>{designation}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max Hours Per Week *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="40"
                          value={formData.maxHoursPerWeek}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxHoursPerWeek: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Priority
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="low">Visiting</option>
                          <option value="medium">Regular</option>
                          <option value="high">Core</option>
                        </select>
                      </div>
                    </div>

                    {/* Subjects */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subjects *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                        {subjectsList.map(subject => (
                          <label key={subject} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.subjects.includes(subject)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({ ...prev, subjects: [...prev.subjects, subject] }));
                                } else {
                                  setFormData(prev => ({ ...prev, subjects: prev.subjects.filter(s => s !== subject) }));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{subject}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Select at least one subject
                      </p>
                      {formData.subjects.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">
                          At least one subject is required
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Saving...' : modalType === 'edit' ? 'Update Teacher' : 'Add Teacher'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default TeachersManagement;
