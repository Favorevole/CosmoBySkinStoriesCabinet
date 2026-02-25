import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000
});

// Add client auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('clientToken');
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
      localStorage.removeItem('clientToken');
      window.location.href = '/client/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const clientRegister = (fullName, email, password) =>
  api.post('/client/auth/register', { fullName, email, password });

export const clientLogin = (email, password) =>
  api.post('/client/auth/login', { email, password });

export const getClientMe = () =>
  api.get('/client/auth/me');

export const updateClientProfile = (data) =>
  api.patch('/client/profile', data);

export const changeClientPassword = (currentPassword, newPassword) =>
  api.post('/client/change-password', { currentPassword, newPassword });

// Dashboard
export const getClientDashboard = () =>
  api.get('/client/dashboard');

// Consultations
export const getClientConsultations = () =>
  api.get('/client/consultations');

export const getClientConsultation = (id) =>
  api.get(`/client/consultations/${id}`);

export const getClientPhotoUrl = (consultationId, photoId) => {
  const token = localStorage.getItem('clientToken');
  const base = import.meta.env.VITE_API_URL || '/api';
  return `${base}/client/consultations/${consultationId}/photos/${photoId}${token ? `?token=${token}` : ''}`;
};

export const uploadClientPhotos = (consultationId, files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('photos', file));
  return api.post(`/client/consultations/${consultationId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  });
};

// Care scheme
export const getClientCareScheme = () =>
  api.get('/client/care-scheme');

// Skin timeline
export const getClientSkinTimeline = () =>
  api.get('/client/skin-timeline');

export const getClientTimelinePhotoUrl = (photoId) => {
  const token = localStorage.getItem('clientToken');
  const base = import.meta.env.VITE_API_URL || '/api';
  return `${base}/client/skin-timeline/${photoId}${token ? `?token=${token}` : ''}`;
};

// Subscription
export const getClientSubscription = () =>
  api.get('/client/subscription');

export const createClientSubscription = (planId) =>
  api.post('/client/subscription', { planId });

export const cancelClientSubscription = () =>
  api.post('/client/subscription/cancel');

// Procedures
export const getClientProcedures = () =>
  api.get('/client/procedures');

export const createClientProcedure = (data) =>
  api.post('/client/procedures', data);

export const updateClientProcedure = (id, data) =>
  api.patch(`/client/procedures/${id}`, data);

export const deleteClientProcedure = (id) =>
  api.delete(`/client/procedures/${id}`);

export const completeClientProcedure = (id) =>
  api.post(`/client/procedures/${id}/complete`);

export default api;
