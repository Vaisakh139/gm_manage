import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const adminLinks = [
  { to: '/admin/dashboard', label: '📊 Dashboard' },
  { to: '/admin/members', label: '👥 Members' },
  { to: '/admin/trainers', label: '🏋️ Trainers' },
  { to: '/admin/plans', label: '📋 Plans' },
  { to: '/admin/payments', label: '💳 Payments' },
];

const trainerLinks = [
  { to: '/trainer/members', label: '👥 Assigned Members' },
  { to: '/trainer/workouts', label: '📝 Workout Plans' },
];

const memberLinks = [
  { to: '/member/profile', label: '👤 Profile' },
  { to: '/member/membership', label: '🏷️ Membership' },
  { to: '/member/workout', label: '💪 Workout Plan' },
  { to: '/member/payments', label: '💳 Payments' },
];

export default function Layout({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user?.role === 'ADMIN' ? adminLinks
    : user?.role === 'TRAINER' ? trainerLinks
    : memberLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">🏃 GymPro</div>
        <nav className="sidebar-nav">
          <div className="sidebar-section">{user?.role}</div>
          {links.map(l => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">{user?.email}</div>
          <button className="sidebar-link btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>
      <div className="main-content">
        <div className="topbar">{title}</div>
        <div className="page"><Outlet /></div>
      </div>
    </div>
  );
}
