import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { BookingPage } from './pages/BookingPage';
import { RegisterPage } from './pages/RegisterPage';
import { ReservationDetailPage } from './pages/ReservationDetailPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { SearchPage } from './pages/SearchPage';

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<SearchPage />} />
              <Route path="/reservar" element={<BookingPage />} />
              <Route path="/reservas" element={<ReservationsPage />} />
              <Route path="/reservas/:id" element={<ReservationDetailPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <footer className="footer">Hotel Fachada · Taller Patrón Facade</footer>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
