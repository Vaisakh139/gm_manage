# GymPro Frontend

React + TypeScript + Tailwind CSS application for the GymPro Gym Management System.

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19.2 | UI framework |
| TypeScript | 6.0 | Type safety |
| Vite | 8.0 | Build tool + dev server |
| Tailwind CSS | 4.0 | Utility-first styling |
| React Router | 7.1 | Client-side routing |
| Axios | 1.7 | HTTP client |

## Getting Started

```bash
npm install
npm run dev         # http://localhost:5173
npm run build       # Production build
npx tsc -b          # TypeScript check
```

## Structure

```
src/
├── api/
│   ├── axios.ts          ← Axios instance + all API groups (authApi, adminApi, etc.)
│   ├── interceptors.ts   ← Request (JWT) + Response (401/403/500) interceptors
│   └── index.ts          ← Barrel export
├── components/
│   ├── common/           ← Layout, Sidebar, ProtectedRoute, Toast
│   ├── public/           ← Navbar, RegisterModal, GymSearchSection, GymDetailModal
│   └── ui/               ← Modal, Badge
├── context/
│   └── AuthContext.tsx   ← JWT + role + passwordChanged state
├── pages/
│   ├── public/           ← Home (landing page with gym search)
│   ├── auth/             ← Login, ForgotPassword, ResetPassword, ChangePassword
│   ├── admin/            ← Dashboard, GymManagement, UserManagement
│   ├── gymowner/         ← Dashboard, GymProfile, MembersList, AddEditMember
│   └── member/           ← Dashboard, Profile, MemberChangePassword
└── types/
    └── index.ts          ← All TypeScript interfaces
```

## Routes

| Path | Role | Page |
|---|---|---|
| `/` | Public | Landing page (gym search, register) |
| `/login` | Public | Login form |
| `/forgot-password` | Public | Forgot password form |
| `/reset-password?token=X` | Public | Reset password |
| `/change-password` | Any auth | Force password change (first login) |
| `/admin/dashboard` | ADMIN | Stats overview |
| `/admin/gyms` | ADMIN | Gym management (CRUD + owner creation) |
| `/admin/users` | ADMIN | User management (enable/disable) |
| `/gym-owner/dashboard` | GYM_OWNER | Aggregate stats + per-branch breakdown |
| `/gym-owner/profile` | GYM_OWNER | Manage gym branches |
| `/gym-owner/members?gymId=X` | GYM_OWNER | Members list (branch-scoped) |
| `/gym-owner/members/add` | GYM_OWNER | Add member |
| `/gym-owner/members/:id/edit` | GYM_OWNER | Edit member |
| `/member/dashboard` | MEMBER | Membership details |
| `/member/profile` | MEMBER | View/edit profile |
| `/member/change-password` | MEMBER | Change password |

## Authentication

JWT stored in `localStorage`. The `AuthContext` provides:
- `user` — `{ token, userId, name, email, role, passwordChanged }`
- `login(userData)` — store credentials
- `logout()` — clear credentials
- `markPasswordChanged()` — update flag after password change

`ProtectedRoute` handles:
1. Unauthenticated → redirect `/login`
2. `passwordChanged: false` → redirect `/change-password`
3. Wrong role → redirect to own dashboard

## API Layer

All requests go through a single Axios instance with two interceptors:

**Request interceptor:** Attaches `Authorization: Bearer <token>` to every request.

**Response interceptor:**
- `401` → clears localStorage, redirects to `/login`
- `403` → logs warning, propagates error (component shows message)
- Network error → returns friendly "server unreachable" message
- `500` → logs error, propagates

## Multi-Gym Support

A GYM_OWNER can have multiple gym branches. The Members List page:
- Shows a tab/button selector when the owner has >1 gym
- Persists selected gym in the URL (`?gymId=X`)
- All member operations are scoped to the selected gym

## Environment

Backend URL is set in `src/api/axios.ts`:
```typescript
baseURL: 'http://localhost:8080/api'
```

For production, move to `.env`:
```
VITE_API_URL=https://your-api.com/api
```
