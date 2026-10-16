import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { session, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand">
          <span className="navbar__logo" aria-hidden="true">H</span>
          Hotel Fachada
        </NavLink>

        {session && (
          <nav className="navbar__links" aria-label="Menú principal">
            <NavLink to="/" end>
              Buscar habitaciones
            </NavLink>
            <NavLink to="/reservas">Mis reservas</NavLink>
            <span className="navbar__user" title={session.email}>
              Hola, {session.fullName.split(' ')[0]}
            </span>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => logout()}>
              Cerrar sesión
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
