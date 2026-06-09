import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

// Members
export const getMembers = () => api.get('/members');
export const getMember = (id: number) => api.get(`/members/${id}`);
export const getMyMemberProfile = () => api.get('/members/me');
export const createMember = (data: object) => api.post('/members', data);
export const updateMember = (id: number, data: object) => api.put(`/members/${id}`, data);
export const deleteMember = (id: number) => api.delete(`/members/${id}`);

// Trainers
export const getTrainers = () => api.get('/trainers');
export const getTrainer = (id: number) => api.get(`/trainers/${id}`);
export const getMyTrainerProfile = () => api.get('/trainers/me');
export const createTrainer = (data: object) => api.post('/trainers', data);
export const updateTrainer = (id: number, data: object) => api.put(`/trainers/${id}`, data);
export const deleteTrainer = (id: number) => api.delete(`/trainers/${id}`);

// Plans
export const getPlans = () => api.get('/plans');
export const getPlan = (id: number) => api.get(`/plans/${id}`);
export const createPlan = (data: object) => api.post('/plans', data);
export const updatePlan = (id: number, data: object) => api.put(`/plans/${id}`, data);
export const deletePlan = (id: number) => api.delete(`/plans/${id}`);

// Payments
export const getPayments = () => api.get('/payments');
export const getPayment = (id: number) => api.get(`/payments/${id}`);
export const getMyPayments = () => api.get('/payments/my');
export const createPayment = (data: object) => api.post('/payments', data);
export const updatePayment = (id: number, data: object) => api.put(`/payments/${id}`, data);
export const deletePayment = (id: number) => api.delete(`/payments/${id}`);

// Workout Plans
export const getWorkoutPlans = () => api.get('/workout-plans');
export const getTrainerWorkoutPlans = () => api.get('/workout-plans/trainer');
export const getMemberWorkoutPlans = () => api.get('/workout-plans/member');
export const createWorkoutPlan = (data: object) => api.post('/workout-plans', data);
export const updateWorkoutPlan = (id: number, data: object) => api.put(`/workout-plans/${id}`, data);
export const deleteWorkoutPlan = (id: number) => api.delete(`/workout-plans/${id}`);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');
