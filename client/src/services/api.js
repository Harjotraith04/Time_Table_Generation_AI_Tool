import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ==================== AUTH API ====================
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials)
  return response.data
}

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData)
  return response.data
}

export const logout = async () => {
  const response = await api.post('/auth/logout')
  return response.data
}

export const getProfile = async () => {
  const response = await api.get('/auth/profile')
  return response.data
}

// User Management (Admin only)
export const createUser = async (userData) => {
  const response = await api.post('/auth/create-user', userData)
  return response.data
}

export const getUsers = async (params = {}) => {
  const response = await api.get('/auth/users', { params })
  return response.data
}

export const deleteUser = async (userId) => {
  const response = await api.delete(`/auth/users/${userId}`)
  return response.data
}

// ==================== TIMETABLE API ====================
export const generateTimetable = async (data) => {
  const response = await api.post('/timetables/generate', data)
  return response.data
}

export const getTimetables = async (params = {}) => {
  const response = await api.get('/timetables', { params })
  return response.data
}

export const getTimetable = async (id, format = 'full') => {
  const response = await api.get(`/timetables/${id}`, { params: { format } })
  return response.data
}

export const updateTimetableStatus = async (id, status, comments) => {
  const response = await api.patch(`/timetables/${id}/status`, { status, comments })
  return response.data
}

export const deleteTimetable = async (id) => {
  const response = await api.delete(`/timetables/${id}`)
  return response.data
}

export const getTimetableProgress = async (id) => {
  const response = await api.get(`/timetables/generate/${id}/progress`)
  return response.data
}

export const addTimetableComment = async (id, comment) => {
  const response = await api.post(`/timetables/${id}/comments`, { comment })
  return response.data
}

export const getTimetableStatistics = async () => {
  const response = await api.get('/timetables/statistics/overview')
  return response.data
}

export const resolveConflict = async (timetableId, conflictIndex, resolutionNotes) => {
  const response = await api.patch(`/timetables/${timetableId}/conflicts/${conflictIndex}/resolve`, { resolutionNotes })
  return response.data
}

export const detectTimetableConflicts = async (timetableId) => {
  const response = await api.post(`/timetables/${timetableId}/detect-conflicts`)
  return response.data
}

// ==================== DATA API ====================
// Teachers
export const getTeachers = async (params = {}) => {
  const response = await api.get('/data/teachers', { params })
  return response.data
}

export const getTeacher = async (id) => {
  const response = await api.get(`/data/teachers/${id}`)
  return response.data
}

export const createTeacher = async (teacherData) => {
  const response = await api.post('/data/teachers', teacherData)
  return response.data
}

export const updateTeacher = async (id, teacherData) => {
  const response = await api.put(`/data/teachers/${id}`, teacherData)
  return response.data
}

export const deleteTeacher = async (id) => {
  const response = await api.delete(`/data/teachers/${id}`)
  return response.data
}

export const bulkImportTeachers = async (file) => {
  const formData = new FormData()
  formData.append('csv', file)
  
  const response = await api.post('/data/teachers/bulk-import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

// Classrooms
export const getClassrooms = async (params = {}) => {
  const response = await api.get('/data/classrooms', { params })
  return response.data
}

export const createClassroom = async (classroomData) => {
  const response = await api.post('/data/classrooms', classroomData)
  return response.data
}

export const updateClassroom = async (id, classroomData) => {
  const response = await api.put(`/data/classrooms/${id}`, classroomData)
  return response.data
}

export const deleteClassroom = async (id) => {
  const response = await api.delete(`/data/classrooms/${id}`)
  return response.data
}

export const bulkImportClassrooms = async (classrooms) => {
  const response = await api.post('/data/classrooms/bulk-import', { classrooms })
  return response.data
}

// Courses
export const getCourses = async (params = {}) => {
  const response = await api.get('/data/courses', { params })
  return response.data
}

export const createCourse = async (courseData) => {
  const response = await api.post('/data/courses', courseData)
  return response.data
}

export const updateCourse = async (id, courseData) => {
  const response = await api.put(`/data/courses/${id}`, courseData)
  return response.data
}

export const deleteCourse = async (id) => {
  const response = await api.delete(`/data/courses/${id}`)
  return response.data
}

export const bulkImportCourses = async (courses) => {
  const response = await api.post('/data/courses/bulk-import', { courses })
  return response.data
}

// Programs
export const getPrograms = async (params = {}) => {
  const response = await api.get('/data/programs', { params })
  return response.data
}

export const getProgram = async (id) => {
  const response = await api.get(`/data/programs/${id}`)
  return response.data
}

export const createProgram = async (programData) => {
  const response = await api.post('/data/programs', programData)
  return response.data
}

export const updateProgram = async (id, programData) => {
  const response = await api.put(`/data/programs/${id}`, programData)
  return response.data
}

export const deleteProgram = async (id) => {
  const response = await api.delete(`/data/programs/${id}`)
  return response.data
}

// Divisions
export const getDivisions = async (params = {}) => {
  const response = await api.get('/data/divisions', { params })
  return response.data
}

export const getDivision = async (id) => {
  const response = await api.get(`/data/divisions/${id}`)
  return response.data
}

export const createDivision = async (divisionData) => {
  const response = await api.post('/data/divisions', divisionData)
  return response.data
}

export const updateDivision = async (id, divisionData) => {
  const response = await api.put(`/data/divisions/${id}`, divisionData)
  return response.data
}

export const deleteDivision = async (id) => {
  const response = await api.delete(`/data/divisions/${id}`)
  return response.data
}

// Data validation and statistics
export const validateData = async () => {
  const response = await api.get('/data/validate')
  return response.data
}

export const getDataStatistics = async () => {
  const response = await api.get('/data/statistics')
  return response.data
}

// Student statistics (counts by department + total)
export const getStudentStats = async () => {
  const response = await api.get('/data/students/stats')
  return response.data
}

// Get all timetable data (Students, Teachers, Classrooms, Programs, Divisions, System Config, Holidays, Courses)
export const getAllTimetableData = async () => {
  const response = await api.get('/data/all-timetable-data')
  return response.data
}

// ==================== ALGORITHM API ====================
export const getAlgorithms = async () => {
  const response = await api.get('/algorithm/algorithms')
  return response.data
}

export const getConstraints = async () => {
  const response = await api.get('/algorithm/constraints')
  return response.data
}

export const getOptimizationGoals = async () => {
  const response = await api.get('/algorithm/optimization-goals')
  return response.data
}

export const validateAlgorithmParameters = async (algorithm, parameters) => {
  const response = await api.post('/algorithm/validate-parameters', { algorithm, parameters })
  return response.data
}

export const getAlgorithmRecommendations = async (dataSize, constraints = [], priorities = {}, timeLimit = 1800) => {
  const response = await api.post('/algorithm/recommend', { 
    dataSize, 
    constraints, 
    priorities, 
    timeLimit 
  })
  return response.data
}

// Additional utility functions
export const uploadCSV = async (file, type) => {
  const formData = new FormData()
  formData.append('csv', file)
  
  const response = await api.post(`/data/${type}/bulk-import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export const exportData = async (type, format = 'csv') => {
  const response = await api.get(`/data/${type}/export`, {
    params: { format },
    responseType: 'blob'
  })
  return response.data
}

// ==================== QUERY RESOLUTION API ====================
export const getQueries = async (params = {}) => {
  const response = await api.get('/queries', { params })
  return response.data
}

export const getQuery = async (id) => {
  const response = await api.get(`/queries/${id}`)
  return response.data
}

export const createQuery = async (queryData) => {
  const response = await api.post('/queries', queryData)
  return response.data
}

export const updateQueryStatus = async (id, status) => {
  const response = await api.patch(`/queries/${id}/status`, { status })
  return response.data
}

export const respondToQuery = async (id, response) => {
  const responseData = await api.post(`/queries/${id}/respond`, { response })
  return responseData.data
}

export const addQueryComment = async (id, text) => {
  const response = await api.post(`/queries/${id}/comments`, { text })
  return response.data
}

export const getQueryStatistics = async () => {
  const response = await api.get('/queries/statistics/overview')
  return response.data
}

export const deleteQuery = async (id) => {
  const response = await api.delete(`/queries/${id}`)
  return response.data
}

// ==================== CHATBOT API ====================
export const sendChatbotMessage = async (message, userRole, userId) => {
  const response = await api.post('/chatbot/message', {
    message,
    userRole,
    userId
  })
  return response.data
}

export const getChatbotSuggestions = async () => {
  const response = await api.get('/chatbot/suggestions')
  return response.data
}

export const submitChatbotFeedback = async (messageId, rating, comment) => {
  const response = await api.post('/chatbot/feedback', {
    messageId,
    rating,
    comment
  })
  return response.data
}
