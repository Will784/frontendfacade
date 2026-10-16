import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Only for logged-in users; otherwise it sends the user to the login page. */
export function ProtectedRoute() {
  const { session } = useAuth();
  const location = useLocation();
  return session ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

/** Login and registration pages: a logged-in user goes straight to the app. */
export function PublicOnlyRoute() {
  const { session } = useAuth();
  return session ? <Navigate to="/" replace /> : <Outlet />;
}
