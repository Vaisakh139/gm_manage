import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';
import Trainers from './pages/admin/Trainers';
import Plans from './pages/admin/Plans';
import Payments from './pages/admin/Payments';
import AssignedMembers from './pages/trainer/AssignedMembers';
import WorkoutPlans from './pages/trainer/WorkoutPlans';
import Profile from './pages/member/Profile';
import Membership from './pages/member/Membership';
import WorkoutPlan from './pages/member/WorkoutPlan';
import PaymentHistory from './pages/member/PaymentHistory';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN']}>
              <Layout title="Admin Panel" />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="trainers" element={<Trainers />} />
            <Route path="plans" element={<Plans />} />
            <Route path="payments" element={<Payments />} />
          </Route>

          {/* Trainer routes */}
          <Route path="/trainer" element={
            <ProtectedRoute roles={['TRAINER']}>
              <Layout title="Trainer Panel" />
            </ProtectedRoute>
          }>
            <Route path="members" element={<AssignedMembers />} />
            <Route path="workouts" element={<WorkoutPlans />} />
          </Route>

          {/* Member routes */}
          <Route path="/member" element={
            <ProtectedRoute roles={['MEMBER']}>
              <Layout title="Member Portal" />
            </ProtectedRoute>
          }>
            <Route path="profile" element={<Profile />} />
            <Route path="membership" element={<Membership />} />
            <Route path="workout" element={<WorkoutPlan />} />
            <Route path="payments" element={<PaymentHistory />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
