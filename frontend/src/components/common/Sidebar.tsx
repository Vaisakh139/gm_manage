import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';

const navItems: Record<Role, { to: string; label: string; icon: string }[]> = {
  ADMIN: [
    { to: '/admin/dashboard',  label: 'Dashboard',       icon: '📊' },
    { to: '/admin/gyms',       label: 'Gym Management',  icon: '🏢' },
    { to: '/admin/users',      label: 'User Management', icon: '👥' },
    { to: '/admin/equipment',  label: 'Equipment',       icon: '🏋️' },
  ],
  GYM_OWNER: [
    { to: '/gym-owner/dashboard', label: 'Dashboard',   icon: '📊' },
    { to: '/gym-owner/profile',   label: 'Gym Profile', icon: '🏢' },
    { to: '/gym-owner/members',   label: 'Members',     icon: '👥' },
    { to: '/gym-owner/equipment', label: 'Equipment',   icon: '🏋️' },
    { to: '/gym-owner/plans',    label: 'Plans',    icon: '📋' },
    { to: '/gym-owner/payments',   label: 'Payments',   icon: '💳' },
    { to: '/gym-owner/trainers',   label: 'Trainers',   icon: '🏅' },
    { to: '/gym-owner/attendance', label: 'Attendance', icon: '📅' },
  ],
  MEMBER: [
    { to: '/member/dashboard',         label: 'Dashboard',       icon: '📊' },
    { to: '/member/profile',           label: 'Profile',         icon: '👤' },
    { to: '/member/equipment',         label: 'Equipment',       icon: '🏋️' },
    { to: '/member/plans',           label: 'Membership Plans', icon: '📋' },
    { to: '/member/payments',    label: 'Payment History', icon: '💳' },
    { to: '/member/trainer',    label: 'My Trainer',   icon: '🏅' },
    { to: '/member/attendance', label: 'Attendance',   icon: '📅' },
    { to: '/member/change-password',   label: 'Change Password', icon: '🔒' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;
  const links = navItems[user.role] ?? [];

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleLabel = user.role === 'GYM_OWNER' ? 'Gym Owner'
    : user.role === 'ADMIN' ? 'Admin'
    : 'Member';

  return (
    <aside className="w-64 min-h-screen bg-gray-900 flex flex-col">
      <div className="px-6 py-6 border-b border-gray-700">
        <h1 className="text-white text-xl font-bold tracking-tight">🏃 GymPro</h1>
        <p className="text-gray-400 text-xs mt-1">{roleLabel}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link: { to: string; label: string; icon: string }) => (
          <NavLink key={link.to} to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-white text-gray-900' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700">
        <div className="mb-3">
          <p className="text-white text-sm font-medium truncate">{user.name}</p>
          <p className="text-gray-400 text-xs truncate">{user.email}</p>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
