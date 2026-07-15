import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return roles.includes(user.roleName) ? children : <Navigate to="/" replace />;
}

export const HOME_ROUTE_BY_ROLE = {
  AGENT: '/register-arrival',
  SUPERVISOR: '/containers',
  ADMIN: '/users'
};
