import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000 // Reduce timeout from 30s to 10s
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
export const requestCode = (telegramId, telegramUsername) =>
  api.post('/auth/request-code', { telegramId, telegramUsername });

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

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const getPhotoUrl = (applicationId, photoId) => {
  const token = localStorage.getItem('token');
  return `${API_BASE}/applications/${applicationId}/photos/${photoId}${token ? `?token=${token}` : ''}`;
};

// Doctors
export const getDoctors = () =>
  api.get('/doctors');

export const getAvailableDoctors = () =>
  api.get('/doctors/available');

export const createDoctor = (data) =>
  api.post('/doctors', data);

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
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  });

export const payWebApplication = (id, promoCode = null) =>
  api.post(`/web/applications/${id}/pay`, promoCode ? { promoCode } : null, { timeout: 30000 });

export const getWebSkinProblems = () =>
  api.get('/web/skin-problems');

export const checkApplicationStatus = (id) =>
  api.get(`/web/application/${id}/status`);

// Public reviews (no auth)
export const getPublicReviews = () =>
  api.get('/web/reviews');

// Reviews (admin)
export const getAdminReviews = () =>
  api.get('/reviews');

export const approveReviewApi = (id) =>
  api.post(`/reviews/${id}/approve`);

export const rejectReviewApi = (id) =>
  api.post(`/reviews/${id}/reject`);

export const deleteReviewApi = (id) =>
  api.delete(`/reviews/${id}`);

// Settings
export const getSkinProblems = () =>
  api.get('/settings/skin-problems');

export const updateSkinProblems = (problems) =>
  api.put('/settings/skin-problems', { problems });

// Payment reminders
export const sendPaymentReminder = (id) =>
  api.post(`/applications/${id}/remind-payment`);

// Promo codes (admin)
export const getPromoCodes = () =>
  api.get('/promo-codes');

export const createPromoCodeApi = (data) =>
  api.post('/promo-codes', data);

export const updatePromoCodeApi = (id, data) =>
  api.patch(`/promo-codes/${id}`, data);

export const deletePromoCodeApi = (id) =>
  api.delete(`/promo-codes/${id}`);

// Payments (admin, requires canSeeRevenue)
export const getPayments = () =>
  api.get('/payments');

export const updateExcludedClients = (clientIds) =>
  api.put('/payments/excluded-clients', { clientIds });

// Promo code validation (public)
export const validatePromoCodeApi = (code) =>
  api.post('/web/validate-promo', { code });

export default api;
