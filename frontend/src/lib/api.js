// src/lib/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — force logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth endpoints ────────────────────────────────────────────────────────────
export const authApi = {
  register: (data)         => api.post('/auth/register', data),
  login: (data)            => api.post('/auth/login', data),
  logout: ()               => api.post('/auth/logout'),
  me: ()                   => api.get('/auth/me'),
  changePassword: (data)   => api.put('/auth/change-password', data),
}

// ─── Job endpoints ─────────────────────────────────────────────────────────────
export const jobApi = {
  list: (params)           => api.get('/jobs', { params }),
  show: (slug)             => api.get(`/jobs/${slug}`),
  // Employer
  myJobs: (params)         => api.get('/employer/jobs', { params }),
  create: (data)           => api.post('/employer/jobs', data),
  update: (id, data)       => api.put(`/employer/jobs/${id}`, data),
  delete: (id)             => api.delete(`/employer/jobs/${id}`),
  jobApplications: (id)    => api.get(`/employer/jobs/${id}/applications`),
  updateAppStatus: (id, d) => api.patch(`/employer/applications/${id}/status`, d),
}

// ─── Application endpoints ─────────────────────────────────────────────────────
export const applicationApi = {
  apply: (jobId, data)     => api.post(`/candidate/jobs/${jobId}/apply`, data),
  myApps: ()               => api.get('/candidate/applications'),
  savedJobs: ()            => api.get('/candidate/saved-jobs'),
  toggleSave: (jobId)      => api.post(`/candidate/jobs/${jobId}/save`),
}

// ─── Profile endpoints ─────────────────────────────────────────────────────────
export const profileApi = {
  show: ()                 => api.get('/profile'),
  update: (data)           => api.put('/profile', data),
  updateCompany: (data)    => api.put('/profile/company', data),
  updateCandidate: (data)  => api.put('/profile/candidate', data),
}

// ─── Admin endpoints ───────────────────────────────────────────────────────────
export const adminApi = {
  stats: ()                => api.get('/admin/stats'),
  users: (params)          => api.get('/admin/users', { params }),
  toggleUser: (id)         => api.patch(`/admin/users/${id}/toggle-status`),
  jobs: (params)           => api.get('/admin/jobs', { params }),
  updateJobStatus: (id, d) => api.patch(`/admin/jobs/${id}/status`, d),
  deleteJob: (id)          => api.delete(`/admin/jobs/${id}`),
}
