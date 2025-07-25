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

// Timetable API functions
export const generateTimetable = async (data) => {
  const response = await api.post('/timetables/generate', data)
  return response.data
}

export const getTimetables = async () => {
  const response = await api.get('/timetables')
  return response.data
}

export const getTimetable = async (id) => {
  const response = await api.get(`/timetables/${id}`)
  return response.data
}

export const updateTimetable = async (id, data) => {
  const response = await api.put(`/timetables/${id}`, data)
  return response.data
}

export const deleteTimetable = async (id) => {
  const response = await api.delete(`/timetables/${id}`)
  return response.data
}

export const exportTimetable = async (id, format = 'pdf') => {
  const response = await api.get(`/timetables/${id}/export`, {
    params: { format },
    responseType: 'blob'
  })
  return response.data
}

// Analytics API functions
export const getTimetableAnalytics = async (id) => {
  const response = await api.get(`/timetables/${id}/analytics`)
  return response.data
}

export default api 