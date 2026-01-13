import axios from 'axios';

// API Base URL - will use proxy in development, direct URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Methods

// Authentication
export const authAPI = {
  login: (email, password, role) => api.post('/auth/login', { email, password, role }),
  registerCompany: (data) => api.post('/auth/register/company', data),
  registerEmployee: (data) => api.post('/auth/register/employee', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  enable2FA: (phoneNumber) => api.post('/auth/2fa/enable', { phoneNumber }),
  verify2FA: (code) => api.post('/auth/2fa/verify', { code }),
  disable2FA: () => api.post('/auth/2fa/disable'),
};

// Employee APIs
export const employeeAPI = {
  search: (params) => api.get('/employees/search', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  getProfile: () => api.get('/employees/profile'),
  updateProfile: (data) => api.put('/employees/profile', data),
  deleteProfile: () => api.delete('/employees/profile'),
  getStats: (id) => api.get(`/employees/${id}/stats`),
  exportData: () => api.get('/employees/export'),
};

// Company APIs
export const companyAPI = {
  getProfile: () => api.get('/companies/profile'),
  updateProfile: (data) => api.put('/companies/profile', data),
  getStats: () => api.get('/companies/stats'),
  getEmployees: () => api.get('/companies/employees'),
};

// Review APIs
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getByEmployee: (employeeId) => api.get(`/reviews/employee/${employeeId}`),
  getByCompany: () => api.get('/reviews/company'),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  getStats: (employeeId) => api.get(`/reviews/stats/${employeeId}`),
};

// Document APIs
export const documentAPI = {
  getByEmployee: (employeeId) => api.get(`/documents/employee/${employeeId}`),
  getMyDocuments: () => api.get('/documents/my'),
  verify: (id, status, notes) => api.put(`/documents/${id}/verify`, { status, notes }),
  delete: (id) => api.delete(`/documents/${id}`),
  download: (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Analytics APIs
export const analyticsAPI = {
  getCompanyAnalytics: () => api.get('/analytics/company'),
  getEmployeeAnalytics: () => api.get('/analytics/employee'),
  trackEvent: (eventType, data) => api.post('/analytics/track', { eventType, data }),
};

// Audit Log APIs
export const auditAPI = {
  getLogs: (params) => api.get('/audit/logs', { params }),
  getMyLogs: () => api.get('/audit/my-logs'),
};

// Consent APIs
export const consentAPI = {
  give: (consentData) => api.post('/consent', consentData),
  withdraw: () => api.post('/consent/withdraw'),
  getStatus: () => api.get('/consent/status'),
};

export default api;