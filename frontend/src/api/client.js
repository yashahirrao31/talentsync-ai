import axios from 'axios'

// Empty string = use relative URLs → all requests go through nginx (same origin, no CORS)
// Set VITE_API_URL only if you need to hit a different backend (e.g. Render deployment)
const API_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  // 90 seconds: Render free tier takes 30-60s to wake from sleep
  timeout: 90000,
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ats_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Better error messages for common failure modes
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.userMessage = 'Server is starting up, please try again in 30 seconds...'
    } else if (!error.response) {
      error.userMessage = 'Cannot reach server. Please try again shortly.'
    }
    return Promise.reject(error)
  }
)

// Auth
export const register = (data) => api.post('/api/auth/register', data)
export const login = (data) => api.post('/api/auth/login', data)
export const getProfile = () => api.get('/api/auth/me')

// Resume Analysis
export const analyzeResume = (formData) =>
  api.post('/api/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 180000, // 3 min for file upload + AI analysis
  })

// History
export const getHistory = () => api.get('/api/history')
export const getScan = (id) => api.get(`/api/history/${id}`)
export const deleteScan = (id) => api.delete(`/api/history/${id}`)

// Admin
export const getAdminDashboard = () => api.get('/api/admin/dashboard')

export default api
