import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;