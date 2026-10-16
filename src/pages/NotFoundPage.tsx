import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="page page--narrow">
      <div className="card text-center">
        <h1>Página no encontrada</h1>
        <p>La dirección que buscas no existe.</p>
        <Link to="/" className="btn btn--primary">
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
