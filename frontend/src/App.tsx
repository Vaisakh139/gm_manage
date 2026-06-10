import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';

// Public
import Home from './pages/public/Home';

// Auth
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ChangePassword from './pages/auth/ChangePassword';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import GymManagement from './pages/admin/GymManagement';
import UserManagement from './pages/admin/UserManagement';

// Gym Owner
import GymOwnerDashboard from './pages/gymowner/Dashboard';
import GymProfile from './pages/gymowner/GymProfile';
import MembersList from './pages/gymowner/MembersList';
import AddEditMember from './pages/gymowner/AddEditMember';

// Member
import MemberDashboard from './pages/member/Dashboard';
import MemberProfile from './pages/member/Profile';
import MemberChangePassword from './pages/member/MemberChangePassword';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public ──────────────────────────────────── */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/change-password" element={
              <ProtectedRoute><ChangePassword /></ProtectedRoute>
            } />

            {/* ── Admin ───────────────────────────────────── */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['ADMIN']}>
                <Layout title="Admin Panel" />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="gyms" element={<GymManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* ── Gym Owner ───────────────────────────────── */}
            <Route path="/gym-owner" element={
              <ProtectedRoute roles={['GYM_OWNER']}>
                <Layout title="Gym Owner Panel" />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<GymOwnerDashboard />} />
              <Route path="profile" element={<GymProfile />} />
              <Route path="members" element={<MembersList />} />
              <Route path="members/add" element={<AddEditMember />} />
              <Route path="members/:id/edit" element={<AddEditMember />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* ── Member ──────────────────────────────────── */}
            <Route path="/member" element={
              <ProtectedRoute roles={['MEMBER']}>
                <Layout title="Member Portal" />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<MemberDashboard />} />
              <Route path="profile" element={<MemberProfile />} />
              <Route path="change-password" element={<MemberChangePassword />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
