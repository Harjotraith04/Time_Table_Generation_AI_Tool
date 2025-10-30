import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { 
  Users, 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Filter,
  Edit3,
  Trash2,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  Calendar,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  X,
  ArrowLeft,
  FileText,
  UserPlus
} from 'lucide-react';

const StudentManagement = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'bulk'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showCredentials, setShowCredentials] = useState([]);

  // Filters and search
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    program: '',
    year: '',
    semester: '',
    division: '',
    status: 'Active'
  });

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  });

  // Form data for new/edit student
  const [formData, setFormData] = useState({
    studentId: '',
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      }
    },
    academicInfo: {
      department: '',
      program: '',
      year: 1,
      semester: 1,
      division: '',
      batch: '',
      rollNumber: '',
      admissionDate: '',
      academicYear: ''
    },
    guardianInfo: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    }
  });

  // Bulk creation data
  const [bulkData, setBulkData] = useState({
    students: [],
    sendCredentials: false
  });

  // File upload
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [filters, pagination.current]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams({
        page: pagination.current,
        limit: pagination.limit,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`http://localhost:8000/api/data/students?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch students');
      }

      const data = await response.json();
      console.log('Students fetched:', data);
      setStudents(data.data.students);
      setPagination(prev => ({ ...prev, ...data.data.pagination }));
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      department: '',
      program: '',
      year: '',
      semester: '',
      division: '',
      status: 'Active'
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const endpoint = modalType === 'edit' ? 
        `/api/data/students/${selectedStudent.studentId}` : 
        '/api/data/students';
      
      const method = modalType === 'edit' ? 'PUT' : 'POST';

      // Filter out empty gender field to avoid validation error
      const dataToSend = { ...formData };
      if (!dataToSend.personalInfo.gender) {
        delete dataToSend.personalInfo.gender;
      }

      console.log(`${method} ${endpoint}`, dataToSend);

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save student');
      }

      const data = await response.json();
      console.log('Student saved:', data);
      setSuccess(data.message);
      setShowModal(false);
      fetchStudents();
      resetForm();
    } catch (err) {
      console.error('Error saving student:', err);
      setError('Failed to save student: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This will deactivate the student account.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`http://localhost:8000/api/data/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete student');
      }

      const data = await response.json();
      console.log('Student deleted:', data);
      setSuccess(data.message);
      fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('Failed to delete student: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = (student) => {
    // Helper function to format date to YYYY-MM-DD for input[type="date"]
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    setSelectedStudent(student);
    setFormData({
      studentId: student.studentId,
      personalInfo: student.personalInfo || {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        }
      },
      academicInfo: {
        department: student.academicInfo?.department || '',
        program: student.academicInfo?.program || '',
        year: student.academicInfo?.year || 1,
        semester: student.academicInfo?.semester || 1,
        division: student.academicInfo?.division || '',
        batch: student.academicInfo?.batch || '',
        rollNumber: student.academicInfo?.rollNumber || '',
        admissionDate: formatDateForInput(student.academicInfo?.admissionDate),
        academicYear: student.academicInfo?.academicYear || ''
      },
      guardianInfo: student.guardianInfo || {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      },
      status: student.status || 'Active'
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleBulkCreate = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Bulk creating students:', bulkData);
      
      const response = await fetch('http://localhost:8000/api/data/students/bulk-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(bulkData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create students');
      }

      const data = await response.json();
      console.log('Bulk creation result:', data);
      setUploadResult(data.data);
      setSuccess(data.message);
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      console.error('Error in bulk creation:', err);
      setError('Failed to create students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      setError('Please select a CSV file');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('csvFile', uploadFile);
      formData.append('sendCredentials', bulkData.sendCredentials);

      console.log('Uploading CSV file...');

      const response = await fetch('http://localhost:8000/api/data/students/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }

      const data = await response.json();
      console.log('CSV upload result:', data);
      setUploadResult(data.data);
      setSuccess(data.message);
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      console.error('Error uploading CSV:', err);
      setError('Failed to upload file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setError('');
      
      const queryParams = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      );

      const response = await fetch(`http://localhost:8000/api/data/students/export?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export students');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Students exported successfully');
    } catch (err) {
      console.error('Error exporting students:', err);
      setError('Failed to export students: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        }
      },
      academicInfo: {
        department: '',
        program: '',
        year: 1,
        semester: 1,
        division: '',
        batch: '',
        rollNumber: '',
        admissionDate: '',
        academicYear: ''
      },
      guardianInfo: {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      }
    });
  };

  const openModal = (type, student = null) => {
    setModalType(type);
    if (student && type === 'edit') {
      handleEditStudent(student);
    } else {
      setSelectedStudent(student);
      resetForm();
      setShowModal(true);
    }
  };

  const toggleCredentialVisibility = (index) => {
    setShowCredentials(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Student Management</h1>
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
        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-600 dark:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
            <span className="text-green-700 dark:text-green-300">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto text-green-600 dark:text-green-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => openModal('add')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </button>
              <button
                onClick={() => openModal('bulk')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Bulk Add
              </button>
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-3">
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="computer-science">Computer Science</option>
              <option value="business">Business</option>
              <option value="medical">Medical</option>
              <option value="law">Law</option>
            </select>

            <select
              value={filters.program}
              onChange={(e) => handleFilterChange('program', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Programs</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="MBA">MBA</option>
              <option value="BBA">BBA</option>
            </select>

            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>

            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange('semester', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>

            <input
              type="text"
              placeholder="Division"
              value={filters.division}
              onChange={(e) => handleFilterChange('division', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            <button
              onClick={clearFilters}
              className="flex items-center justify-center px-3 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-green-600 dark:text-green-400 font-semibold">Created: {uploadResult.created?.length || 0}</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="text-red-600 dark:text-red-400 font-semibold">Failed: {uploadResult.failed?.length || 0}</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-blue-600 dark:text-blue-400 font-semibold">Accounts Created: {uploadResult.userAccountsCreated?.length || 0}</div>
              </div>
            </div>

            {/* Show credentials if any */}
            {uploadResult.userAccountsCreated?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Student Login Credentials:</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg max-h-60 overflow-y-auto">
                  {uploadResult.userAccountsCreated.map((account, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                      <div>
                        <span className="font-medium">{account.studentId}</span> - {account.email}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          Password: {showCredentials.includes(index) ? account.tempPassword : '••••••••'}
                        </span>
                        <button
                          onClick={() => toggleCredentialVisibility(index)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {showCredentials.includes(index) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ Please save these credentials and share them with the respective students. For security, change passwords on first login.
                </div>
              </div>
            )}

            <button
              onClick={() => setUploadResult(null)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close Results
            </button>
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Academic Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Loading students...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No students found
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {student.personalInfo.firstName.charAt(0)}{student.personalInfo.lastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {student.personalInfo.firstName} {student.personalInfo.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {student.studentId} | Roll: {student.academicInfo.rollNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {student.academicInfo.program} - Year {student.academicInfo.year}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {student.academicInfo.department} | Div: {student.academicInfo.division}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {student.personalInfo.email}
                        </div>
                        {student.personalInfo.phone && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {student.personalInfo.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          student.status === 'Inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('edit', student)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit student"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.studentId)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page {pagination.current} of {pagination.pages} ({pagination.total} total students)
                </div>
                <div className="flex space-x-2">
                  <button
                    disabled={!pagination.hasPrev}
                    onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <button
                    disabled={!pagination.hasNext}
                    onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit/Bulk */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {modalType === 'add' ? 'Add New Student' :
                   modalType === 'edit' ? 'Edit Student' : 'Bulk Add Students'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {modalType === 'bulk' ? (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                            Upload CSV file with student data
                          </span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept=".csv"
                            className="sr-only"
                            onChange={(e) => setUploadFile(e.target.files[0])}
                          />
                          <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                            CSV files only
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {uploadFile && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                        <span className="text-blue-800 dark:text-blue-300">
                          Selected: {uploadFile.name}
                        </span>
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
                      {loading ? 'Uploading...' : 'Upload & Create Students'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Student ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.studentId}
                        onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.academicInfo.rollNumber}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          academicInfo: { ...prev.academicInfo, rollNumber: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.personalInfo.firstName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, firstName: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.personalInfo.lastName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, lastName: e.target.value }
                        }))}
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
                        value={formData.personalInfo.email}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, email: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.personalInfo.phone}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, phone: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Academic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department *
                      </label>
                      <select
                        required
                        value={formData.academicInfo.department}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          academicInfo: { ...prev.academicInfo, department: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select Department</option>
                        <option value="engineering">Engineering</option>
                        <option value="computer-science">Computer Science</option>
                        <option value="business">Business</option>
                        <option value="medical">Medical</option>
                        <option value="law">Law</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Program *
                      </label>
                      <select
                        required
                        value={formData.academicInfo.program}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          academicInfo: { ...prev.academicInfo, program: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select Program</option>
                        <option value="B.Tech">B.Tech</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="MBA">MBA</option>
                        <option value="BBA">BBA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Year *
                      </label>
                      <select
                        required
                        value={formData.academicInfo.year}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          academicInfo: { ...prev.academicInfo, year: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Semester *
                      </label>
                      <select
                        required
                        value={formData.academicInfo.semester}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          academicInfo: { ...prev.academicInfo, semester: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Division *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.academicInfo.division}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          academicInfo: { ...prev.academicInfo, division: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Batch
                      </label>
                      <input
                        type="text"
                        value={formData.academicInfo.batch}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          academicInfo: { ...prev.academicInfo, batch: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Academic Year *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 2024-2025"
                        value={formData.academicInfo.academicYear}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          academicInfo: { ...prev.academicInfo, academicYear: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Admission Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.academicInfo.admissionDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        academicInfo: { ...prev.academicInfo, admissionDate: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
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
                      {loading ? 'Saving...' : modalType === 'edit' ? 'Update Student' : 'Create Student'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
