import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps a route that requires login. Pass adminOnly to also require ROLE_ADMIN.
export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}
