import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { 
  getCourses, createCourse, updateCourse, deleteCourse,
  getPrograms, createProgram, updateProgram, deleteProgram,
  getDivisions, createDivision, updateDivision, deleteDivision
} from '../services/api';
import { 
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Plus,
  Upload,
  Download,
  Edit2,
  Trash2,
  Save,
  X,
  Users,
  GraduationCap,
  School,
  Clock,
  BookOpenCheck,
  FlaskConical,
  Calendar,
  Loader
} from 'lucide-react';

const ProgramsData = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [courses, setCourses] = useState([]);
  // Programs list (loaded from API)
  const [programs, setPrograms] = useState([]);
  // Program form state for add/edit
  const [programForm, setProgramForm] = useState({
    name: '',
    code: '',
    school: '',
    type: '',
    duration: '',
    totalSemesters: '',
    status: 'Active'
  });
  // Student divisions / batches (loaded from API)
  const [divisions, setDivisions] = useState([]);
  // Division form state for add/edit
  const [divisionForm, setDivisionForm] = useState({
    name: '',
    program: '',
    year: '',
    semester: '',
    studentCount: '',
    labBatches: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data from API on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchCourses(),
      fetchPrograms(),
      fetchDivisions()
    ]);
  };

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPrograms();
      setPrograms(response.data || []);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to load programs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await getDivisions();
      setDivisions(response.data || []);
    } catch (err) {
      console.error('Error fetching divisions:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCourses();
      setCourses(response.data || response.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    department: '',
    program: '',
    year: '',
    semester: '',
    credits: '',
    type: 'Theory',
    hoursPerWeek: '',
    hasLab: false,
    labHours: '',
    enrolledStudents: '',
    assignedTeachers: [],
    prerequisites: [],
    status: 'Active'
  });

  const schools = ['Engineering', 'Business', 'Sciences', 'Arts', 'Medicine', 'Law'];
  const programTypes = ['Bachelor', 'Master', 'Doctorate', 'Diploma', 'Certificate'];
  const courseTypes = ['Theory', 'Practical', 'Tutorial', 'Seminar'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleBack = () => {
    navigate('/classrooms-data');
  };

  const handleNext = () => {
    navigate('/infrastructure-data');
  };

  const handleAddCourse = async () => {
    try {
      setLoading(true);
      
      // Prepare course data with all required fields
      const courseData = {
        ...courseForm,
        id: courseForm.code || `COURSE-${Date.now()}`,
        department: courseForm.department || 'General',
        year: parseInt(courseForm.year) || 1,
        semester: parseInt(courseForm.semester) || 1,
        credits: parseInt(courseForm.credits) || 3,
        hoursPerWeek: parseInt(courseForm.hoursPerWeek) || 3,
        totalHoursPerWeek: parseInt(courseForm.hoursPerWeek) || 3,
        enrolledStudents: parseInt(courseForm.enrolledStudents) || 30,
        assignedTeachers: courseForm.assignedTeachers.length > 0 
          ? courseForm.assignedTeachers 
          : [{ teacherId: 'TBD' }] // Placeholder if no teacher assigned
      };
      
      // Validate required fields
      if (!courseData.name || !courseData.code || !courseData.program) {
        alert('Please fill in Course Name, Code, and Program');
        setLoading(false);
        return;
      }
      
      await createCourse(courseData);
      await fetchCourses(); // Reload courses from API
      resetCourseForm();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding course:', err);
      const errorMsg = err.response?.data?.errors 
        ? err.response.data.errors.map(e => e.msg).join('\n')
        : err.response?.data?.message || 'Failed to add course. Please try again.';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setCourseForm(course);
    setEditingItem(course._id || course.id);
    setActiveTab('courses');
    setShowAddForm(true);
  };

  const handleUpdateCourse = async () => {
    try {
      setLoading(true);
      await updateCourse(editingItem, courseForm);
      await fetchCourses(); // Reload courses from API
      resetCourseForm();
      setShowAddForm(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating course:', err);
      alert('Failed to update course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      setLoading(true);
      await deleteCourse(courseId);
      await fetchCourses(); // Reload courses from API
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('Failed to delete course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      name: '',
      code: '',
      department: '',
      program: '',
      year: '',
      semester: '',
      credits: '',
      type: 'Theory',
      hoursPerWeek: '',
      hasLab: false,
      labHours: '',
      enrolledStudents: '',
      assignedTeachers: [],
      prerequisites: [],
      status: 'Active'
    });
  };

  const resetProgramForm = () => {
    setProgramForm({
      name: '',
      code: '',
      school: '',
      type: '',
      duration: '',
      totalSemesters: '',
      status: 'Active'
    });
  };

  const resetDivisionForm = () => {
    setDivisionForm({
      name: '',
      program: '',
      year: '',
      semester: '',
      studentCount: '',
      labBatches: 0
    });
  };

  const handleAddProgram = async () => {
    try {
      setLoading(true);
      // Generate ID from code if not provided
      const programData = {
        ...programForm,
        id: programForm.code || `PROG-${Date.now()}`,
        duration: parseInt(programForm.duration) || 4,
        totalSemesters: parseInt(programForm.totalSemesters) || 8
      };
      
      // Validate required fields
      if (!programData.name || !programData.code || !programData.school || !programData.type) {
        alert('Please fill in all required fields: Name, Code, School, and Type');
        setLoading(false);
        return;
      }
      
      await createProgram(programData);
      await fetchPrograms();
      resetProgramForm();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding program:', err);
      const errorMsg = err.response?.data?.errors 
        ? err.response.data.errors.map(e => e.msg).join('\n')
        : err.response?.data?.message || 'Failed to add program. Please try again.';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProgram = (program) => {
    setProgramForm(program);
    setEditingItem(program._id || program.id);
    setActiveTab('programs');
    setShowAddForm(true);
  };

  const handleUpdateProgram = async () => {
    try {
      setLoading(true);
      await updateProgram(editingItem, programForm);
      await fetchPrograms();
      resetProgramForm();
      setShowAddForm(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating program:', err);
      alert(err.response?.data?.message || 'Failed to update program. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProgram = async (programId) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    
    try {
      setLoading(true);
      await deleteProgram(programId);
      await fetchPrograms();
    } catch (err) {
      console.error('Error deleting program:', err);
      alert(err.response?.data?.message || 'Failed to delete program. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDivision = async () => {
    try {
      setLoading(true);
      // Generate ID from name if not provided
      const divisionData = {
        ...divisionForm,
        id: `DIV-${divisionForm.program}-${divisionForm.year}-${divisionForm.semester}-${divisionForm.name}`.replace(/\s+/g, '-'),
        year: parseInt(divisionForm.year),
        semester: parseInt(divisionForm.semester),
        studentCount: parseInt(divisionForm.studentCount),
        labBatches: parseInt(divisionForm.labBatches) || 0
      };
      
      // Validate required fields
      if (!divisionData.name || !divisionData.program || !divisionData.year || !divisionData.semester || !divisionData.studentCount) {
        alert('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      await createDivision(divisionData);
      await fetchDivisions();
      resetDivisionForm();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding division:', err);
      const errorMsg = err.response?.data?.errors 
        ? err.response.data.errors.map(e => e.msg).join('\n')
        : err.response?.data?.message || 'Failed to add division. Please try again.';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDivision = (division) => {
    setDivisionForm(division);
    setEditingItem(division._id || division.id);
    setActiveTab('divisions');
    setShowAddForm(true);
  };

  const handleUpdateDivision = async () => {
    try {
      setLoading(true);
      await updateDivision(editingItem, divisionForm);
      await fetchDivisions();
      resetDivisionForm();
      setShowAddForm(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating division:', err);
      alert(err.response?.data?.message || 'Failed to update division. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDivision = async (divisionId) => {
    if (!confirm('Are you sure you want to delete this division?')) return;
    
    try {
      setLoading(true);
      await deleteDivision(divisionId);
      await fetchDivisions();
    } catch (err) {
      console.error('Error deleting division:', err);
      alert(err.response?.data?.message || 'Failed to delete division. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgramForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingItem ? 'Edit Program' : 'Add New Program'}
          </h3>
          <button
            onClick={() => {
              setShowAddForm(false);
              setEditingItem(null);
              resetProgramForm();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Program Name</label>
              <input
                type="text"
                value={programForm.name}
                onChange={(e) => setProgramForm({...programForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Program Code</label>
              <input
                type="text"
                value={programForm.code}
                onChange={(e) => setProgramForm({...programForm, code: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="CS"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">School/Faculty</label>
              <select
                value={programForm.school}
                onChange={(e) => setProgramForm({...programForm, school: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select School</option>
                {schools.map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Program Type</label>
              <select
                value={programForm.type}
                onChange={(e) => setProgramForm({...programForm, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Type</option>
                {programTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (Years)</label>
              <input
                type="number"
                value={programForm.duration}
                onChange={(e) => setProgramForm({...programForm, duration: parseInt(e.target.value) || ''})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="4"
                min="1"
                max="8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Semesters</label>
              <input
                type="number"
                value={programForm.totalSemesters}
                onChange={(e) => setProgramForm({...programForm, totalSemesters: parseInt(e.target.value) || ''})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="8"
                min="1"
                max="16"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
          <button
            onClick={() => {
              setShowAddForm(false);
              setEditingItem(null);
              resetProgramForm();
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={editingItem ? handleUpdateProgram : handleAddProgram}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{editingItem ? 'Update Program' : 'Add Program'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderCourseForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Course
          </h3>
          <button
            onClick={() => {
              setShowAddForm(false);
              resetCourseForm();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Name</label>
              <input
                type="text"
                value={courseForm.name}
                onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Data Structures"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Code</label>
              <input
                type="text"
                value={courseForm.code}
                onChange={(e) => setCourseForm({...courseForm, code: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="CS102"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
              <select
                value={courseForm.department}
                onChange={(e) => setCourseForm({...courseForm, department: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Department</option>
                {schools.map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Program</label>
              <select
                value={courseForm.program}
                onChange={(e) => setCourseForm({...courseForm, program: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Program</option>
                {programs.map(program => (
                  <option key={program.id} value={program.name}>{program.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
              <select
                value={courseForm.year}
                onChange={(e) => setCourseForm({...courseForm, year: parseInt(e.target.value) || ''})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Year</option>
                {[1, 2, 3, 4, 5].map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Semester</label>
              <select
                value={courseForm.semester}
                onChange={(e) => setCourseForm({...courseForm, semester: parseInt(e.target.value) || ''})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Semester</option>
                {[1, 2].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Credits</label>
              <input
                type="number"
                value={courseForm.credits}
                onChange={(e) => setCourseForm({...courseForm, credits: parseInt(e.target.value) || ''})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="3"
                min="1"
                max="6"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Type</label>
              <select
                value={courseForm.type}
                onChange={(e) => setCourseForm({...courseForm, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {courseTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theory Hours/Week</label>
              <input
                type="number"
                value={courseForm.hoursPerWeek}
                onChange={(e) => setCourseForm({...courseForm, hoursPerWeek: parseInt(e.target.value) || ''})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="3"
                min="1"
                max="8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lab Hours/Week</label>
              <input
                type="number"
                value={courseForm.labHours}
                onChange={(e) => setCourseForm({...courseForm, labHours: parseInt(e.target.value) || ''})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="2"
                min="0"
                max="6"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enrolled Students</label>
              <input
                type="number"
                value={courseForm.enrolledStudents}
                onChange={(e) => setCourseForm({...courseForm, enrolledStudents: parseInt(e.target.value) || ''})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="60"
                min="1"
                max="500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasLab"
              checked={courseForm.hasLab}
              onChange={(e) => setCourseForm({...courseForm, hasLab: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="hasLab" className="text-sm text-gray-700 dark:text-gray-300">
              This course has a laboratory component
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
          <button
            onClick={() => {
              setShowAddForm(false);
              resetCourseForm();
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAddCourse}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderDivisionForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingItem ? 'Edit Division' : 'Add New Division'}
          </h3>
          <button
            onClick={() => {
              setShowAddForm(false);
              setEditingItem(null);
              resetDivisionForm();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Division Name</label>
              <input
                type="text"
                value={divisionForm.name}
                onChange={(e) => setDivisionForm({...divisionForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Division A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Program</label>
              <select
                value={divisionForm.program}
                onChange={(e) => setDivisionForm({...divisionForm, program: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Program</option>
                {programs.map(program => (
                  <option key={program.id} value={program.name}>{program.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
              <select
                value={divisionForm.year}
                onChange={(e) => setDivisionForm({...divisionForm, year: parseInt(e.target.value) || ''})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Year</option>
                {[1, 2, 3, 4, 5].map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Semester</label>
              <select
                value={divisionForm.semester}
                onChange={(e) => setDivisionForm({...divisionForm, semester: parseInt(e.target.value) || ''})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Semester</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student Count</label>
              <input
                type="number"
                value={divisionForm.studentCount}
                onChange={(e) => setDivisionForm({...divisionForm, studentCount: parseInt(e.target.value) || ''})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="60"
                min="1"
                max="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lab Batches</label>
              <input
                type="number"
                value={divisionForm.labBatches}
                onChange={(e) => setDivisionForm({...divisionForm, labBatches: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="2"
                min="0"
                max="10"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
          <button
            onClick={() => {
              setShowAddForm(false);
              setEditingItem(null);
              resetDivisionForm();
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={editingItem ? handleUpdateDivision : handleAddDivision}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{editingItem ? 'Update Division' : 'Add Division'}</span>
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
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Programs, Courses & Batches</h1>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Academic Programs & Courses</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure academic programs, courses, and student divisions for comprehensive timetable planning
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Programs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{programs.length}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{courses.length}</p>
              </div>
              <BookOpenCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Schools</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(programs.map(p => p.school)).size}
                </p>
              </div>
              <School className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Lab Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {courses.filter(c => c.hasLab).length}
                </p>
              </div>
              <FlaskConical className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('programs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'programs'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Academic Programs
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'courses'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab('divisions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'divisions'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Divisions & Batches
              </button>
            </nav>
          </div>

          {/* Programs Tab */}
          {activeTab === 'programs' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Academic Programs</h3>
                <button
                  onClick={() => {
                    setActiveTab('programs');
                    setShowAddForm(true);
                    resetProgramForm();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Program</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Program Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        School
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {programs.map((program) => (
                      <tr key={program.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{program.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{program.code}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {program.school}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {program.duration} Years ({program.totalSemesters} Semesters)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {program.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {program.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleEditProgram(program)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProgram(program._id || program.id)}
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
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Courses</h3>
                <button
                  onClick={() => {
                    setActiveTab('courses');
                    setShowAddForm(true);
                    resetCourseForm();
                  }}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Course</span>
                </button>
              </div>
              
              {/* Loading State */}
              {loading && courses.length === 0 && (
                <div className="p-12 text-center">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading courses...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-12 text-center">
                  <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <button
                    onClick={fetchCourses}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && courses.length === 0 && (
                <div className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No courses found. Add your first course to get started.</p>
                  <button
                    onClick={() => {
                      setActiveTab('courses');
                      setShowAddForm(true);
                      resetCourseForm();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Course
                  </button>
                </div>
              )}
              
              {/* Data Table */}
              {!loading && !error && courses.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Course Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Program & Semester
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Credits & Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Lab
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{course.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{course.code}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{course.program}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Semester {course.semester}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{course.credits} Credits</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{course.hoursPerWeek}h/week</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {course.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {course.hasLab ? (
                            <span className="flex items-center space-x-1 text-sm text-green-600 dark:text-green-400">
                              <FlaskConical className="w-4 h-4" />
                              <span>{course.labHours}h</span>
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">No Lab</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleEditCourse(course)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCourse(course._id || course.id)}
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
          )}

          {/* Divisions Tab */}
          {activeTab === 'divisions' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Divisions & Lab Batches</h3>
                <button 
                  onClick={() => {
                    setActiveTab('divisions');
                    setShowAddForm(true);
                    resetDivisionForm();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Division</span>
                </button>
              </div>
              
              {/* Empty State */}
              {divisions.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No divisions found. Add your first division to get started.</p>
                  <button
                    onClick={() => {
                      setActiveTab('divisions');
                      setShowAddForm(true);
                      resetDivisionForm();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Division
                  </button>
                </div>
              )}
              
              {/* Division Cards */}
              {divisions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {divisions.map((division) => (
                  <div key={division.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{division.name}</h4>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditDivision(division)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDivision(division._id || division.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{division.program}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Year {division.year}, Semester {division.semester}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{division.studentCount} Students</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FlaskConical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {division.labBatches} Lab Batches {division.labBatches > 0 ? `(${Math.ceil(division.studentCount / division.labBatches)} students each)` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
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
            Back: Classrooms & Labs
          </button>
          
          <button 
            onClick={handleNext}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Next: Infrastructure & Policy
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Add/Edit Form Modals */}
      {showAddForm && activeTab === 'programs' && renderProgramForm()}
      {showAddForm && activeTab === 'courses' && renderCourseForm()}
      {showAddForm && activeTab === 'divisions' && renderDivisionForm()}
    </div>
  );
};

export default ProgramsData;
