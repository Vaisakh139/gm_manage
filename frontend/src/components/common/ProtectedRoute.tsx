import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';

interface Props {
  children: React.ReactElement;
  roles?: Role[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Force password change if still using temp password (skip if already on that page)
  if (!user.passwordChanged && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to the user's own home page
    const home = user.role === 'ADMIN' ? '/admin/dashboard'
      : user.role === 'GYM_OWNER' ? '/gym-owner/dashboard'
      : '/member/dashboard';
    return <Navigate to={home} replace />;
  }

  return children;
}
