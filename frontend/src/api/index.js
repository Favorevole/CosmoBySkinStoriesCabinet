import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const requestCode = (telegramId) =>
  api.post('/auth/request-code', { telegramId });

export const verifyCode = (telegramId, code) =>
  api.post('/auth/verify', { telegramId, code });

export const getMe = () =>
  api.get('/auth/me');

// Applications
export const getApplications = (params) =>
  api.get('/applications', { params });

export const getApplication = (id) =>
  api.get(`/applications/${id}`);

export const assignDoctor = (id, doctorId) =>
  api.post(`/applications/${id}/assign`, { doctorId });

export const updateRecommendation = (id, data) =>
  api.patch(`/applications/${id}/recommendation`, data);

export const approveApplication = (id) =>
  api.post(`/applications/${id}/approve`);

export const getApplicationHistory = (id) =>
  api.get(`/applications/${id}/history`);

export const getPhotoUrl = (applicationId, photoId) =>
  `/api/applications/${applicationId}/photos/${photoId}`;

// Doctors
export const getDoctors = () =>
  api.get('/doctors');

export const getAvailableDoctors = () =>
  api.get('/doctors/available');

export const getDoctor = (id) =>
  api.get(`/doctors/${id}`);

export const updateDoctor = (id, data) =>
  api.patch(`/doctors/${id}`, data);

export const approveDoctor = (id) =>
  api.post(`/doctors/${id}/approve`);

export const blockDoctor = (id) =>
  api.post(`/doctors/${id}/block`);

// Stats
export const getDashboardStats = () =>
  api.get('/stats/dashboard');

export const getDoctorStats = () =>
  api.get('/stats/doctors');

// Web form
export const submitWebApplication = (formData) =>
  api.post('/web/applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const checkApplicationStatus = (id) =>
  api.get(`/web/application/${id}/status`);

export default api;
