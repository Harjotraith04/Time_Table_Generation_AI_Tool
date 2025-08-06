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

// ==================== DATA API ====================
// Teachers
export const getTeachers = async (params = {}) => {
  const response = await api.get('/data/teachers', { params })
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

export const bulkImportTeachers = async (teachers) => {
  const response = await api.post('/data/teachers/bulk-import', { teachers })
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

// Data validation and statistics
export const validateData = async () => {
  const response = await api.get('/data/validate')
  return response.data
}

export const getDataStatistics = async () => {
  const response = await api.get('/data/statistics')
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

export const getAlgorithmRecommendations = async (dataSize) => {
  const response = await api.post('/algorithm/recommend', { dataSize })
  return response.data
}
