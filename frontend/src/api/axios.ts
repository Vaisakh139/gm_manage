import axios from 'axios';
import type { ApiResponse } from '../types';
import { applyInterceptors } from './interceptors';

// ─────────────────────────────────────────────────────────────────────────────
// Axios instance
//
// A single shared instance so every request flows through the same interceptors,
// base URL, and timeout — no per-call configuration needed.
// ─────────────────────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000, // 15 s — prevents requests hanging indefinitely
});

// Wire up request + response interceptors (defined in ./interceptors.ts)
applyInterceptors(api);

export default api;

// ─────────────────────────────────────────────────────────────────────────────
// Auth  — /api/auth/**  (permitAll in SecurityConfig)
// ─────────────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: object) =>
    api.post<ApiResponse<{
      token: string; userId: number; name: string;
      email: string; role: string; passwordChanged: boolean;
    }>>('/auth/register', data),

  login: (email: string, password: string) =>
    api.post<ApiResponse<{
      token: string; userId: number; name: string;
      email: string; role: string; passwordChanged: boolean;
    }>>('/auth/login', { email, password }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<ApiResponse<null>>('/auth/change-password', { currentPassword, newPassword }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<ApiResponse<null>>('/auth/reset-password', { token, newPassword }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Public  — /api/public/**  (no JWT required)
// ─────────────────────────────────────────────────────────────────────────────
export const publicApi = {
  searchGyms: (query = '', page = 0, size = 10) =>
    api.get(`/public/gyms?query=${encodeURIComponent(query)}&page=${page}&size=${size}`),
  getGym: (id: number) =>
    api.get(`/public/gyms/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin  — requires ROLE_ADMIN
// ─────────────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats:         ()                          => api.get('/admin/stats'),
  getGyms:          ()                          => api.get('/admin/gyms'),
  createGym:        (data: object)              => api.post('/admin/gyms', data),
  updateGym:        (id: number, data: object)  => api.put(`/admin/gyms/${id}`, data),
  deleteGym:        (id: number)                => api.delete(`/admin/gyms/${id}`),
  getUsers:         ()                          => api.get('/admin/users'),
  updateUserStatus: (id: number, active: boolean) =>
    api.put(`/admin/users/${id}/status`, { active }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Gym Owner  — requires ROLE_GYM_OWNER
// ─────────────────────────────────────────────────────────────────────────────
export const gymOwnerApi = {
  // Dashboard — aggregate across all owned gyms
  getDashboard:  ()                                  => api.get('/gym-owner/dashboard'),

  // Gym branch management
  getMyGyms:     ()                                  => api.get('/gym-owner/gyms'),
  createGym:     (data: object)                      => api.post('/gym-owner/gyms', data),
  getMyGym:      (gymId: number)                     => api.get(`/gym-owner/gyms/${gymId}`),
  updateMyGym:   (gymId: number, data: object)       => api.put(`/gym-owner/gyms/${gymId}`, data),

  // Members — always scoped to a specific gym
  getMembers: (gymId: number, search = '', page = 0, size = 10) =>
    api.get(`/members?gymId=${gymId}&search=${encodeURIComponent(search)}&page=${page}&size=${size}`),
  getMember:    (id: number)               => api.get(`/members/${id}`),
  addMember:    (data: object)             => api.post('/members', data),   // data must include gymId
  updateMember: (id: number, data: object) => api.put(`/members/${id}`, data),
  deleteMember: (id: number)               => api.delete(`/members/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Member  — requires ROLE_MEMBER
// ─────────────────────────────────────────────────────────────────────────────
export const memberApi = {
  getProfile:    ()             => api.get('/profile'),
  updateProfile: (data: object) => api.put('/profile', data),
};
