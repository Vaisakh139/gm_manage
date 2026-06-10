import axios from 'axios';
import type { ApiResponse } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach JWT ────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — handle 401 ───────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  register: (data: object) =>
    api.post<ApiResponse<{ token: string; userId: number; name: string; email: string; role: string; passwordChanged: boolean }>>('/auth/register', data),
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ token: string; userId: number; name: string; email: string; role: string; passwordChanged: boolean }>>('/auth/login', { email, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<ApiResponse<null>>('/auth/change-password', { currentPassword, newPassword }),
  forgotPassword: (email: string) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post<ApiResponse<null>>('/auth/reset-password', { token, newPassword }),
};

// ── Public (no auth) ─────────────────────────────────────────
export const publicApi = {
  searchGyms: (query = '', page = 0, size = 10) =>
    api.get(`/public/gyms?query=${encodeURIComponent(query)}&page=${page}&size=${size}`),
  getGym: (id: number) =>
    api.get(`/public/gyms/${id}`),
};

// ── Admin ─────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getGyms: () => api.get('/admin/gyms'),
  createGym: (data: object) => api.post('/admin/gyms', data),
  updateGym: (id: number, data: object) => api.put(`/admin/gyms/${id}`, data),
  deleteGym: (id: number) => api.delete(`/admin/gyms/${id}`),
  getUsers: () => api.get('/admin/users'),
  updateUserStatus: (id: number, active: boolean) =>
    api.put(`/admin/users/${id}/status`, { active }),
};

// ── Gym Owner ────────────────────────────────────────────────
export const gymOwnerApi = {
  getDashboard: () => api.get('/gym-owner/dashboard'),
  getMyGym: () => api.get('/gym-owner/gym'),
  updateMyGym: (data: object) => api.put('/gym-owner/gym', data),
  getMembers: (search = '', page = 0, size = 10) =>
    api.get(`/members?search=${search}&page=${page}&size=${size}`),
  getMember: (id: number) => api.get(`/members/${id}`),
  addMember: (data: object) => api.post('/members', data),
  updateMember: (id: number, data: object) => api.put(`/members/${id}`, data),
  deleteMember: (id: number) => api.delete(`/members/${id}`),
};

// ── Member ───────────────────────────────────────────────────
export const memberApi = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data: object) => api.put('/profile', data),
};
