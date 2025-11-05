import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import AdminSidebar from '../components/AdminSidebar';
import { 
  Calendar, 
  Download,
  Printer,
  RefreshCw,
  Eye,
  Filter,
  Share2,
  Star,
  Clock,
  User,
  Users,
  Building2,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart,
  Search,
  Grid3X3,
  List,
  ChevronDown,
  MessageCircle,
  Edit2,
  LogOut,
  Bell,
  Settings
} from 'lucide-react';
import { 
  getTimetables, 
  getTimetable, 
  updateTimetableStatus,
  addTimetableComment,
  resolveConflict,
  detectTimetableConflicts
} from '../services/api';

const ViewTimetable = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [viewType, setViewType] = useState('grid');
  const [timetableViewMode, setTimetableViewMode] = useState('standard'); // 'standard', 'teacher', 'batch', 'classroom'
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [timetables, setTimetables] = useState([]);
  const [currentTimetable, setCurrentTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [showConflictsModal, setShowConflictsModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [selectedClassroom, setSelectedClassroom] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Build time slots dynamically from the saved schedule so the grid
  // uses the exact start-end pairs present in the timetable. This fixes
  // cases where the exported/printed CSV shows many slots but the grid
  // shows only a few because the hard-coded timeSlots didn't match.
  const timeSlots = useMemo(() => {
    if (currentTimetable?.schedule?.length) {
      const slotsSet = new Set(currentTimetable.schedule.map(s => `${s.startTime}-${s.endTime}`));
      const slots = Array.from(slotsSet);

      // Sort by start time then end time (HH:MM strings compare lexicographically)
      slots.sort((a, b) => {
        const [aStart, aEnd] = a.split('-');
        const [bStart, bEnd] = b.split('-');
        if (aStart === bStart) return aEnd.localeCompare(bEnd);
        return aStart.localeCompare(bStart);
      });

      return slots;
    }

    // Fallback defaults when no timetable loaded yet
    return [
      '08:00-09:00', '09:00-10:00', '10:05-11:05', '11:05-11:15',
      '11:15-12:15', '12:20-13:20', '13:20-14:20', '14:20-15:20',
      '15:25-16:25', '16:30-17:30'
    ];
  }, [currentTimetable]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (id) {
        // Load specific timetable
        const response = await getTimetable(id);
        setCurrentTimetable(response.data);
      } else {
        // Load all timetables (not just completed)
        const response = await getTimetables({ });
        setTimetables(response.data);
      }
    } catch (error) {
      console.error('Error loading timetable data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (id) {
      navigate('/view-timetable');
    } else {
      navigate('/admin-dashboard');
    }
  };

  const handleStatusUpdate = async (timetableId, newStatus) => {
    try {
      await updateTimetableStatus(timetableId, newStatus);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating timetable status');
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !currentTimetable) return;

    try {
      await addTimetableComment(currentTimetable._id, comment);
      setComment('');
      setShowCommentModal(false);
      await loadData(); // Refresh to get updated comments
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConflictTypeLabel = (type) => {
    const labels = {
      'teacher_conflict': 'Teacher Conflict',
      'room_conflict': 'Room Conflict',
      'student_conflict': 'Student Conflict',
      'constraint_violation': 'Constraint Violation',
      'generation_error': 'Generation Error',
      'system_error': 'System Error',
      'data_error': 'Data Error'
    };
    return labels[type] || type;
  };

  const handleResolveConflict = async (conflictIndex) => {
    if (!currentTimetable) return;

    const resolution = prompt('Enter resolution notes (optional):');
    if (resolution === null) return; // User cancelled

    try {
      await resolveConflict(currentTimetable._id, conflictIndex, resolution || 'Manually resolved');
      await loadData(); // Refresh to get updated conflicts
    } catch (error) {
      console.error('Error resolving conflict:', error);
      alert('Error resolving conflict');
    }
  };

  const handleDetectConflicts = async () => {
    if (!currentTimetable) return;

    try {
      const response = await detectTimetableConflicts(currentTimetable._id);
      alert(`Conflict detection completed. Found ${response.conflictCount} conflicts.`);
      await loadData(); // Refresh to get updated conflicts
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      alert('Error detecting conflicts');
    }
  };

  const filteredSchedule = currentTimetable?.schedule?.filter(slot => {
    const matchesDay = selectedDay === 'all' || slot.day === selectedDay;
    const matchesSearch = !searchTerm || 
      slot.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.classroomName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeacher = selectedTeacher === 'all' || slot.teacherId === selectedTeacher;
    const matchesClassroom = selectedClassroom === 'all' || slot.classroomId === selectedClassroom;
    const matchesBatch = selectedBatch === 'all' || slot.batchId === selectedBatch || slot.divisionId === selectedBatch;
    
    return matchesDay && matchesSearch && matchesTeacher && matchesClassroom && matchesBatch;
  }) || [];

  // Get unique teachers, classrooms, and batches from schedule
  const uniqueTeachers = useMemo(() => {
    if (!currentTimetable?.schedule) return [];
    const teacherMap = new Map();
    currentTimetable.schedule.forEach(slot => {
      if (slot.teacherId && !teacherMap.has(slot.teacherId)) {
        teacherMap.set(slot.teacherId, { id: slot.teacherId, name: slot.teacherName || 'Unknown' });
      }
    });
    return Array.from(teacherMap.values());
  }, [currentTimetable]);

  const uniqueClassrooms = useMemo(() => {
    if (!currentTimetable?.schedule) return [];
    const classroomMap = new Map();
    currentTimetable.schedule.forEach(slot => {
      if (slot.classroomId && !classroomMap.has(slot.classroomId)) {
        classroomMap.set(slot.classroomId, { id: slot.classroomId, name: slot.classroomName || 'Unknown' });
      }
    });
    return Array.from(classroomMap.values());
  }, [currentTimetable]);

  const uniqueBatches = useMemo(() => {
    if (!currentTimetable?.schedule) return [];
    const batchMap = new Map();
    currentTimetable.schedule.forEach(slot => {
      const batchId = slot.batchId || slot.divisionId;
      if (batchId && !batchMap.has(batchId)) {
        batchMap.set(batchId, { id: batchId, name: batchId });
      }
    });
    return Array.from(batchMap.values());
  }, [currentTimetable]);

  const getQualityColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper: download a file blob
  const downloadFile = (content, filename, mime = 'text/csv') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Export current timetable schedule as CSV
  const exportCurrentTimetableCSV = () => {
    if (!currentTimetable?.schedule) return;
    const rows = [];
    rows.push(['Day','StartTime','EndTime','CourseCode','CourseName','SessionType','Teacher','Classroom','StudentCount']);
    // Sort schedule by day and startTime for consistent ordering
    const order = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
    const sorted = [...currentTimetable.schedule].sort((a,b) => {
      if (order[a.day] !== order[b.day]) return order[a.day] - order[b.day];
      if (a.startTime === b.startTime) return a.endTime.localeCompare(b.endTime);
      return a.startTime.localeCompare(b.startTime);
    });

    for (const s of sorted) {
      rows.push([
        s.day || '',
        s.startTime || '',
        s.endTime || '',
        s.courseCode || s.courseId || '',
        s.courseName || '',
        s.sessionType || '',
        s.teacherName || '',
        s.classroomName || '',
        s.studentCount != null ? String(s.studentCount) : ''
      ]);
    }

    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
    const filename = `${currentTimetable.name || 'timetable'}.csv`;
    downloadFile(csv, filename, 'text/csv');
  };

  const exportCurrentTimetableJSON = () => {
    if (!currentTimetable) return;
    const json = JSON.stringify(currentTimetable, null, 2);
    const filename = `${currentTimetable.name || 'timetable'}.json`;
    downloadFile(json, filename, 'application/json');
  };

  const printTimetable = () => {
    if (!currentTimetable) return;
    // Open a new window and render a simple printable view
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    const doc = printWindow.document.open();
    const title = currentTimetable.name || 'Timetable';
    const scheduleHtml = (currentTimetable.schedule || []).map(s => `
      <tr>
        <td>${s.day || ''}</td>
        <td>${s.startTime || ''}</td>
        <td>${s.endTime || ''}</td>
        <td>${s.courseCode || s.courseId || ''}</td>
        <td>${s.courseName || ''}</td>
        <td>${s.sessionType || ''}</td>
        <td>${s.teacherName || ''}</td>
        <td>${s.classroomName || ''}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>body{font-family: Arial, Helvetica, sans-serif;}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}th{background:#f3f4f6;text-align:left}</style>
        </head>
        <body>
          <h2>${title}</h2>
          <table>
            <thead><tr><th>Day</th><th>Start</th><th>End</th><th>Code</th><th>Course</th><th>Type</th><th>Teacher</th><th>Room</th></tr></thead>
            <tbody>
              ${scheduleHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Give the window a moment to render then trigger print
    setTimeout(() => { printWindow.print(); }, 500);
  };

  // Export timetable by id (used from list view)
  const exportTimetableFromList = async (id, name = 'timetable') => {
    try {
      const response = await getTimetable(id, 'schedule_only');
      const timetable = response.data;
      if (!timetable || !timetable.schedule) {
        alert('No schedule available to export');
        return;
      }

      // Build CSV similar to exportCurrentTimetableCSV
      const rows = [];
      rows.push(['Day','StartTime','EndTime','CourseCode','CourseName','SessionType','Teacher','Classroom','StudentCount']);
      const order = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
      const sorted = [...timetable.schedule].sort((a,b) => {
        if (order[a.day] !== order[b.day]) return order[a.day] - order[b.day];
        if (a.startTime === b.startTime) return a.endTime.localeCompare(b.endTime);
        return a.startTime.localeCompare(b.startTime);
      });

      for (const s of sorted) {
        rows.push([
          s.day || '',
          s.startTime || '',
          s.endTime || '',
          s.courseCode || s.courseId || '',
          s.courseName || '',
          s.sessionType || '',
          s.teacherName || '',
          s.classroomName || '',
          s.studentCount != null ? String(s.studentCount) : ''
        ]);
      }

      const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
      const filename = `${name || 'timetable'}.csv`;
      downloadFile(csv, filename, 'text/csv');
    } catch (error) {
      console.error('Error exporting timetable:', error);
      alert('Error exporting timetable');
    }
  };

  const renderConflictsModal = () => {
    if (!showConflictsModal || !currentTimetable) return null;

    const conflicts = currentTimetable.conflicts || [];
    const unresolvedConflicts = conflicts.filter(c => !c.resolved);
    const resolvedConflicts = conflicts.filter(c => c.resolved);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full p-6 my-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Conflict Analysis</h3>
              <p className="text-sm text-gray-500 mt-1">
                {unresolvedConflicts.length} unresolved • {resolvedConflicts.length} resolved
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDetectConflicts}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Re-detect</span>
              </button>
              <button
                onClick={() => setShowConflictsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          {conflicts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Conflicts!</h4>
              <p className="text-gray-500">This timetable has no conflicts detected.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Unresolved Conflicts */}
              {unresolvedConflicts.length > 0 && (
                <>
                  <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Unresolved Conflicts ({unresolvedConflicts.length})
                  </h4>
                  {unresolvedConflicts.map((conflict, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-lg p-4 ${getSeverityColor(conflict.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-semibold">{getConflictTypeLabel(conflict.type)}</span>
                          <span className="ml-2 text-xs uppercase px-2 py-1 rounded bg-white bg-opacity-50">
                            {conflict.severity}
                          </span>
                        </div>
                        <button
                          onClick={() => handleResolveConflict(idx)}
                          className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Resolve</span>
                        </button>
                      </div>
                      <p className="text-sm mb-2">{conflict.description}</p>
                      {conflict.involvedEntities && (
                        <div className="text-xs space-y-1">
                          {conflict.involvedEntities.teachers?.length > 0 && (
                            <p><strong>Teachers:</strong> {conflict.involvedEntities.teachers.join(', ')}</p>
                          )}
                          {conflict.involvedEntities.classrooms?.length > 0 && (
                            <p><strong>Classrooms:</strong> {conflict.involvedEntities.classrooms.join(', ')}</p>
                          )}
                          {conflict.involvedEntities.courses?.length > 0 && (
                            <p><strong>Courses:</strong> {conflict.involvedEntities.courses.join(', ')}</p>
                          )}
                          {conflict.involvedEntities.timeSlot && (
                            <p><strong>Time:</strong> {conflict.involvedEntities.timeSlot}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* Resolved Conflicts */}
              {resolvedConflicts.length > 0 && (
                <>
                  <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center mt-6">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Resolved Conflicts ({resolvedConflicts.length})
                  </h4>
                  {resolvedConflicts.map((conflict, idx) => (
                    <div
                      key={idx}
                      className="border border-green-200 rounded-lg p-4 bg-green-50 text-green-800"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold">{getConflictTypeLabel(conflict.type)}</span>
                      </div>
                      <p className="text-sm mb-2">{conflict.description}</p>
                      {conflict.resolutionNotes && (
                        <p className="text-xs italic">Resolution: {conflict.resolutionNotes}</p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowConflictsModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTeacherView = () => {
    if (!currentTimetable?.schedule) return null;

    // Group schedule by teacher
    const teacherSchedules = {};
    currentTimetable.schedule.forEach(slot => {
      if (!teacherSchedules[slot.teacherId]) {
        teacherSchedules[slot.teacherId] = {
          name: slot.teacherName || 'Unknown',
          slots: []
        };
      }
      teacherSchedules[slot.teacherId].slots.push(slot);
    });

    return (
      <div className="space-y-6">
        {Object.entries(teacherSchedules).map(([teacherId, teacher]) => (
          <div key={teacherId} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{teacher.name}</h3>
                  <p className="text-sm text-gray-500">{teacher.slots.length} classes assigned</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left">Day</th>
                    <th className="px-3 py-2 text-left">Time</th>
                    <th className="px-3 py-2 text-left">Course</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {teacher.slots
                    .sort((a, b) => {
                      const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
                      if (dayOrder[a.day] !== dayOrder[b.day]) return dayOrder[a.day] - dayOrder[b.day];
                      return a.startTime.localeCompare(b.startTime);
                    })
                    .map((slot, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-3 py-2">{slot.day}</td>
                        <td className="px-3 py-2">{slot.startTime} - {slot.endTime}</td>
                        <td className="px-3 py-2">
                          <div>
                            <p className="font-medium">{slot.courseName}</p>
                            <p className="text-xs text-gray-500">{slot.courseCode}</p>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            slot.sessionType === 'Theory' ? 'bg-blue-100 text-blue-800' :
                            slot.sessionType === 'Practical' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {slot.sessionType}
                          </span>
                        </td>
                        <td className="px-3 py-2">{slot.classroomName}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderClassroomView = () => {
    if (!currentTimetable?.schedule) return null;

    // Group schedule by classroom
    const classroomSchedules = {};
    currentTimetable.schedule.forEach(slot => {
      if (!classroomSchedules[slot.classroomId]) {
        classroomSchedules[slot.classroomId] = {
          name: slot.classroomName || 'Unknown',
          slots: []
        };
      }
      classroomSchedules[slot.classroomId].slots.push(slot);
    });

    return (
      <div className="space-y-6">
        {Object.entries(classroomSchedules).map(([classroomId, classroom]) => (
          <div key={classroomId} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{classroom.name}</h3>
                  <p className="text-sm text-gray-500">{classroom.slots.length} classes scheduled</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left">Day</th>
                    <th className="px-3 py-2 text-left">Time</th>
                    <th className="px-3 py-2 text-left">Course</th>
                    <th className="px-3 py-2 text-left">Teacher</th>
                    <th className="px-3 py-2 text-left">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {classroom.slots
                    .sort((a, b) => {
                      const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
                      if (dayOrder[a.day] !== dayOrder[b.day]) return dayOrder[a.day] - dayOrder[b.day];
                      return a.startTime.localeCompare(b.startTime);
                    })
                    .map((slot, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-3 py-2">{slot.day}</td>
                        <td className="px-3 py-2">{slot.startTime} - {slot.endTime}</td>
                        <td className="px-3 py-2">
                          <div>
                            <p className="font-medium">{slot.courseName}</p>
                            <p className="text-xs text-gray-500">{slot.courseCode}</p>
                          </div>
                        </td>
                        <td className="px-3 py-2">{slot.teacherName}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            slot.sessionType === 'Theory' ? 'bg-blue-100 text-blue-800' :
                            slot.sessionType === 'Practical' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {slot.sessionType}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBatchView = () => {
    if (!currentTimetable?.schedule) return null;

    // Group schedule by batch/division
    const batchSchedules = {};
    currentTimetable.schedule.forEach(slot => {
      const batchId = slot.batchId || slot.divisionId || 'General';
      if (!batchSchedules[batchId]) {
        batchSchedules[batchId] = {
          name: batchId,
          slots: []
        };
      }
      batchSchedules[batchId].slots.push(slot);
    });

    return (
      <div className="space-y-6">
        {Object.entries(batchSchedules).map(([batchId, batch]) => (
          <div key={batchId} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{batch.name}</h3>
                  <p className="text-sm text-gray-500">{batch.slots.length} classes</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left">Day</th>
                    <th className="px-3 py-2 text-left">Time</th>
                    <th className="px-3 py-2 text-left">Course</th>
                    <th className="px-3 py-2 text-left">Teacher</th>
                    <th className="px-3 py-2 text-left">Room</th>
                    <th className="px-3 py-2 text-left">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {batch.slots
                    .sort((a, b) => {
                      const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
                      if (dayOrder[a.day] !== dayOrder[b.day]) return dayOrder[a.day] - dayOrder[b.day];
                      return a.startTime.localeCompare(b.startTime);
                    })
                    .map((slot, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-3 py-2">{slot.day}</td>
                        <td className="px-3 py-2">{slot.startTime} - {slot.endTime}</td>
                        <td className="px-3 py-2">
                          <div>
                            <p className="font-medium">{slot.courseName}</p>
                            <p className="text-xs text-gray-500">{slot.courseCode}</p>
                          </div>
                        </td>
                        <td className="px-3 py-2">{slot.teacherName}</td>
                        <td className="px-3 py-2">{slot.classroomName}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            slot.sessionType === 'Theory' ? 'bg-blue-100 text-blue-800' :
                            slot.sessionType === 'Practical' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {slot.sessionType}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTimetableGrid = () => {
    if (!currentTimetable?.schedule) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Time</th>
                {daysOfWeek.map(day => (
                  <th key={day} className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {timeSlots.map(timeSlot => (
                <tr key={timeSlot} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {timeSlot}
                  </td>
                  {daysOfWeek.map(day => {
                    const session = currentTimetable.schedule.find(s => 
                      s.day === day && s.startTime + '-' + s.endTime === timeSlot
                    );
                    
                    return (
                      <td key={`${day}-${timeSlot}`} className="px-4 py-4">
                        {session ? (
                          <div className="space-y-1">
                            <div className={`p-3 rounded-lg border-l-4 ${
                              session.sessionType === 'Theory' ? 'bg-blue-50 border-blue-400 dark:bg-blue-900/20' :
                              session.sessionType === 'Practical' ? 'bg-green-50 border-green-400 dark:bg-green-900/20' :
                              'bg-purple-50 border-purple-400 dark:bg-purple-900/20'
                            }`}>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {session.courseName}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {session.courseCode} - {session.sessionType}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                👨‍🏫 {session.teacherName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                🏫 {session.classroomName}
                              </p>
                              {session.studentCount && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  👥 {session.studentCount} students
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="h-16 flex items-center justify-center text-gray-400">
                            <span className="text-xs">Free</span>
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

  const renderTimetableList = () => {
    return (
      <div className="space-y-4">
        {filteredSchedule.map((session, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    session.sessionType === 'Theory' ? 'bg-blue-100 text-blue-800' :
                    session.sessionType === 'Practical' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {session.sessionType}
                  </span>
                  <span className="text-sm font-medium text-gray-500">{session.day}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {session.courseName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {session.courseCode}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{session.startTime} - {session.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{session.teacherName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4" />
                    <span>{session.classroomName}</span>
                  </div>
                </div>
              </div>
              {session.studentCount && (
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{session.studentCount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTimetablesList = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {timetables.map((timetable) => (
            <div key={timetable._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {timetable.name}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>{timetable.department} • Year {timetable.year} • Semester {timetable.semester}</p>
                    {timetable.program && <p>Program: {timetable.program}</p>}
                    <p className="text-xs">Created: {new Date(timetable.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${getStatusColor(timetable.status)}`}>
                  {timetable.status}
                </span>
              </div>

              {timetable.quality && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Quality Score</span>
                    <span className={`font-semibold ${getQualityColor(timetable.quality.overallScore)}`}>
                      {Math.round(timetable.quality.overallScore)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${timetable.quality.overallScore}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Classes:</span>
                  <span className="ml-1 font-medium">{timetable.statistics?.totalClasses || timetable.schedule?.length || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Conflicts:</span>
                  <span className={`ml-1 font-medium ${(timetable.conflicts?.length || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {timetable.conflicts?.length || 0}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`/view-timetable/${timetable._id}`)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                
                {timetable.status === 'completed' && (
                  <button
                    onClick={() => handleStatusUpdate(timetable._id, 'published')}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Publish</span>
                  </button>
                )}
                
                <button
                  onClick={() => exportTimetableFromList(timetable._id, timetable.name)}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading timetable...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b shadow-sm ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-800' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Admin Dashboard
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  All Time Tables
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <button className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}>
                <Bell className="w-5 h-5" />
              </button>
              <button className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}>
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-800 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          {/* Back Button */}
          {/* Page heading removed as requested */}

        {currentTimetable ? (
          // Individual Timetable View
          <>
            {/* Timetable Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentTimetable.name}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">Academic Year</p>
                      <p>{currentTimetable.academicYear}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">Department</p>
                      <p>{currentTimetable.department}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">Semester • Year</p>
                      <p>Semester {currentTimetable.semester} • Year {currentTimetable.year}</p>
                    </div>
                    {currentTimetable.program && (
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">Program</p>
                        <p>{currentTimetable.program}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">Generated</p>
                      <p>{new Date(currentTimetable.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-3">
                  <span className={`px-3 py-1 rounded ${getStatusColor(currentTimetable.status)}`}>
                    {currentTimetable.status}
                  </span>
                  {currentTimetable.quality && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Quality Score</p>
                      <p className={`text-lg font-bold ${getQualityColor(currentTimetable.quality.overallScore)}`}>
                        {Math.round(currentTimetable.quality.overallScore)}%
                      </p>
                    </div>
                  )}
                  {currentTimetable.conflicts && currentTimetable.conflicts.length > 0 && (
                    <button
                      onClick={() => setShowConflictsModal(true)}
                      className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{currentTimetable.conflicts.length} Conflicts</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className="flex flex-col space-y-4">
                {/* View Type Selection */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">View Mode:</label>
                      <select
                        value={timetableViewMode}
                        onChange={(e) => setTimetableViewMode(e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                      >
                        <option value="standard">Standard Grid</option>
                        <option value="teacher">By Teacher</option>
                        <option value="classroom">By Classroom</option>
                        <option value="batch">By Batch/Division</option>
                      </select>
                    </div>

                    {timetableViewMode === 'standard' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewType('grid')}
                          className={`p-2 rounded ${viewType === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewType('list')}
                          className={`p-2 rounded ${viewType === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowCommentModal(true)}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Comment</span>
                    </button>
                    <button
                      onClick={exportCurrentTimetableCSV}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>
                    <button 
                      onClick={exportCurrentTimetableJSON} 
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>JSON</span>
                    </button>
                    <button 
                      onClick={printTimetable} 
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>

                {/* Filters */}
                {timetableViewMode === 'standard' && (
                  <div className="flex items-center space-x-4 flex-wrap gap-2">
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                    >
                      <option value="all">All Days</option>
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>

                    {uniqueTeachers.length > 1 && (
                      <select
                        value={selectedTeacher}
                        onChange={(e) => setSelectedTeacher(e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                      >
                        <option value="all">All Teachers</option>
                        {uniqueTeachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                        ))}
                      </select>
                    )}

                    {uniqueClassrooms.length > 1 && (
                      <select
                        value={selectedClassroom}
                        onChange={(e) => setSelectedClassroom(e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                      >
                        <option value="all">All Classrooms</option>
                        {uniqueClassrooms.map(classroom => (
                          <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
                        ))}
                      </select>
                    )}

                    {uniqueBatches.length > 0 && (
                      <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                      >
                        <option value="all">All Batches</option>
                        {uniqueBatches.map(batch => (
                          <option key={batch.id} value={batch.id}>{batch.name}</option>
                        ))}
                      </select>
                    )}

                    <input
                      type="text"
                      placeholder="Search courses, teachers, rooms..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 min-w-[200px] px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Timetable Display */}
            {timetableViewMode === 'teacher' ? (
              renderTeacherView()
            ) : timetableViewMode === 'classroom' ? (
              renderClassroomView()
            ) : timetableViewMode === 'batch' ? (
              renderBatchView()
            ) : viewType === 'grid' ? (
              renderTimetableGrid()
            ) : (
              renderTimetableList()
            )}

            {/* Statistics */}
            {currentTimetable.statistics && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{currentTimetable.statistics.totalClasses}</p>
                    <p className="text-sm text-gray-500">Total Classes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{currentTimetable.statistics.totalTeachers}</p>
                    <p className="text-sm text-gray-500">Teachers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{currentTimetable.statistics.totalRooms}</p>
                    <p className="text-sm text-gray-500">Rooms Used</p>
                  </div>
                  <div 
                    className="text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2"
                    onClick={() => setShowConflictsModal(true)}
                  >
                    <p className={`text-2xl font-bold ${(currentTimetable.conflicts?.length || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {currentTimetable.conflicts?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center justify-center">
                      Conflicts
                      <AlertCircle className="w-3 h-3 ml-1" />
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Conflicts Modal */}
            {renderConflictsModal()}
          </>
        ) : (
          // Timetables List View
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Generated Timetables</h2>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage all generated timetables
              </p>
            </div>

            {timetables.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Timetables Found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven't generated any timetables yet.
                </p>
                <button
                  onClick={() => navigate('/generate-timetable')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Generate First Timetable
                </button>
              </div>
            ) : (
              renderTimetablesList()
            )}
          </>
        )}
        </main>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Comment</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comment..."
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                disabled={!comment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTimetable;