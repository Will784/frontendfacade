import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppError } from '../api/AppError';
import { Alert } from '../components/Alert';
import { Spinner } from '../components/Spinner';
import { StatusBadge } from '../components/StatusBadge';
import type { Reservation } from '../models/hotel';
import { hotelService } from '../services';
import { DateUtils } from '../utils/DateUtils';
import { formatMoney } from '../utils/format';
import { ROOM_TYPE_LABELS } from '../utils/labels';

export function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hotelService
      .getMyReservations()
      .then(setReservations)
      .catch((err: unknown) => setError(AppError.messageOf(err)));
  }, []);

  return (
    <main className="page">
      <h1>Mis reservas</h1>
      <p className="muted">Selecciona una reserva para agregar servicios, hacer check-in, check-out o ver la factura.</p>

      {error && <Alert type="error">{error}</Alert>}
      {!reservations && !error && <Spinner label="Cargando reservas..." />}

      {reservations?.length === 0 && (
        <div className="card empty-state">
          <p>Todavía no tienes reservas.</p>
          <Link to="/" className="btn btn--primary">
            Buscar habitaciones
          </Link>
        </div>
      )}

      {reservations?.map((reservation) => (
        <article className="card reservation-row" key={reservation.id}>
          <div>
            <h3>
              {reservation.id} · Habitación {reservation.roomNumber} ({ROOM_TYPE_LABELS[reservation.roomType]})
            </h3>
            <p className="muted">
              {DateUtils.formatDate(reservation.checkIn)} → {DateUtils.formatDate(reservation.checkOut)} ·{' '}
              {reservation.guest.fullName}
            </p>
            <StatusBadge status={reservation.status} />
          </div>
          <div className="text-center">
            <p className="room-card__price">{formatMoney(reservation.invoice?.total ?? reservation.currentTotal)}</p>
            <Link to={`/reservas/${reservation.id}`} className="btn btn--outline">
              Gestionar
            </Link>
          </div>
        </article>
      ))}
    </main>
  );
}
