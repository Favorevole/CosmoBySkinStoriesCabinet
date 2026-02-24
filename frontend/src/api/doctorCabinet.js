import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000
});

// Add doctor auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('doctorToken');
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
      localStorage.removeItem('doctorToken');
      window.location.href = '/doctor/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const doctorRegister = (data) =>
  api.post('/doctor-auth/register', data);

export const doctorLogin = (email, password) =>
  api.post('/doctor-auth/login', { email, password });

export const doctorTelegramRequestCode = (telegramId) =>
  api.post('/doctor-auth/telegram-request-code', { telegramId });

export const doctorTelegramLogin = (telegramId, code) =>
  api.post('/doctor-auth/telegram-login', { telegramId, code });

export const getDoctorMe = () =>
  api.get('/doctor-auth/me');

export const linkTelegramRequestCode = (telegramId) =>
  api.post('/doctor-auth/link-telegram-request-code', { telegramId });

export const linkTelegram = (telegramId, code) =>
  api.post('/doctor-auth/link-telegram', { telegramId, code });

export const linkEmail = (email, password) =>
  api.post('/doctor-auth/link-email', { email, password });

export const updateDoctorProfile = (data) =>
  api.patch('/doctor-auth/profile', data);

export const changeDoctorPassword = (currentPassword, newPassword) =>
  api.post('/doctor-auth/change-password', { currentPassword, newPassword });

// Notifications
export const getDoctorNotifications = (params) =>
  api.get('/doctor-cabinet/notifications', { params });

export const getNotificationUnreadCount = () =>
  api.get('/doctor-cabinet/notifications/unread-count');

export const markNotificationRead = (id) =>
  api.post(`/doctor-cabinet/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.post('/doctor-cabinet/notifications/read-all');

// Statistics
export const getDoctorStats = (period) =>
  api.get('/doctor-cabinet/stats', { params: { period } });

// Dashboard
export const getDoctorDashboard = () =>
  api.get('/doctor-cabinet/dashboard');

// Applications
export const getDoctorApplications = (params) =>
  api.get('/doctor-cabinet/applications', { params });

export const getDoctorApplication = (id) =>
  api.get(`/doctor-cabinet/applications/${id}`);

export const getDoctorPhotoUrl = (applicationId, photoId) => {
  const token = localStorage.getItem('doctorToken');
  const base = import.meta.env.VITE_API_URL || '/api';
  return `${base}/doctor-cabinet/applications/${applicationId}/photos/${photoId}${token ? `?token=${token}` : ''}`;
};

export const submitRecommendation = (applicationId, text, links) =>
  api.post(`/doctor-cabinet/applications/${applicationId}/recommendation`, { text, links });

export const declineApplication = (applicationId, reason) =>
  api.post(`/doctor-cabinet/applications/${applicationId}/decline`, { reason });

export const requestPhotos = (applicationId, message) =>
  api.post(`/doctor-cabinet/applications/${applicationId}/request-photos`, { message });

// AI
export const aiGenerate = (applicationId) =>
  api.post(`/doctor-cabinet/applications/${applicationId}/ai-generate`, {}, { timeout: 60000 });

export const aiRefine = (applicationId, history, instruction) =>
  api.post(`/doctor-cabinet/applications/${applicationId}/ai-refine`, { history, instruction }, { timeout: 60000 });

// Patients
export const getDoctorPatients = () =>
  api.get('/doctor-cabinet/patients');

// Templates
export const getTemplates = () =>
  api.get('/doctor-cabinet/templates');

export const createTemplate = (data) =>
  api.post('/doctor-cabinet/templates', data);

export const updateTemplate = (id, data) =>
  api.patch(`/doctor-cabinet/templates/${id}`, data);

export const deleteTemplate = (id) =>
  api.delete(`/doctor-cabinet/templates/${id}`);

// Programs
export const getPrograms = () =>
  api.get('/doctor-cabinet/programs');

export const createProgram = (data) =>
  api.post('/doctor-cabinet/programs', data);

export const updateProgram = (id, data) =>
  api.patch(`/doctor-cabinet/programs/${id}`, data);

export const deleteProgram = (id) =>
  api.delete(`/doctor-cabinet/programs/${id}`);

// Products
export const getProductsList = (category) =>
  api.get('/doctor-cabinet/products', { params: category ? { category } : {} });

export const createProduct = (data) =>
  api.post('/doctor-cabinet/products', data);

export const updateProduct = (id, data) =>
  api.patch(`/doctor-cabinet/products/${id}`, data);

export const deleteProduct = (id) =>
  api.delete(`/doctor-cabinet/products/${id}`);

// Algorithms
export const getAlgorithms = () =>
  api.get('/doctor-cabinet/algorithms');

export const createAlgorithm = (data) =>
  api.post('/doctor-cabinet/algorithms', data);

export const updateAlgorithm = (id, data) =>
  api.patch(`/doctor-cabinet/algorithms/${id}`, data);

export const deleteAlgorithm = (id) =>
  api.delete(`/doctor-cabinet/algorithms/${id}`);

export const matchAlgorithms = (applicationId) =>
  api.post(`/doctor-cabinet/applications/${applicationId}/match-algorithms`);

// Chat
export const getMessages = (applicationId, params) =>
  api.get(`/doctor-cabinet/applications/${applicationId}/messages`, { params });

export const sendMessage = (applicationId, text) =>
  api.post(`/doctor-cabinet/applications/${applicationId}/messages`, { text });

export const markChatRead = (applicationId) =>
  api.post(`/doctor-cabinet/applications/${applicationId}/messages/read`);

export const getChatUnreadCount = () =>
  api.get('/doctor-cabinet/chat/unread-count');

export default api;
