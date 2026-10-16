import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { AppError } from '../api/AppError';
import { Alert } from '../components/Alert';
import { InvoiceView } from '../components/InvoiceView';
import { PriceBreakdown } from '../components/PriceBreakdown';
import { Spinner } from '../components/Spinner';
import { StatusBadge } from '../components/StatusBadge';
import type { ExtraServiceType, Reservation, ServiceCatalogItem } from '../models/hotel';
import { hotelService } from '../services';
import { DateUtils } from '../utils/DateUtils';
import { formatMoney, plural } from '../utils/format';
import { CHARGE_MODE_LABELS, ROOM_TYPE_LABELS, SERVICE_DESCRIPTIONS } from '../utils/labels';

/** Same limit as the backend. */
const MAX_SERVICES = 10;

type Feedback = { type: 'success' | 'error'; message: string } | null;

/**
 * Reservation management panel: summary, additional services, check-in, check-out and invoice.
 */
export function ReservationDetailPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const justCreated = Boolean((location.state as { created?: boolean } | null)?.created);

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(
    justCreated ? { type: 'success', message: '¡Reserva creada con éxito! Ya puedes agregar servicios o hacer check-in.' } : null,
  );
  const [busyAction, setBusyAction] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([hotelService.getReservation(id), hotelService.getServiceCatalog()])
      .then(([found, services]) => {
        setReservation(found);
        setCatalog(services);
      })
      .catch((error: unknown) => setLoadError(AppError.messageOf(error)));
  }, [id]);

  /** Runs an action against the facade and shows the result. */
  const runAction = async (name: string, action: () => Promise<Reservation>, successMessage: string) => {
    setBusyAction(name);
    setFeedback(null);
    try {
      setReservation(await action());
      setFeedback({ type: 'success', message: successMessage });
    } catch (error) {
      setFeedback({ type: 'error', message: AppError.messageOf(error) });
    } finally {
      setBusyAction(null);
    }
  };

  if (loadError) {
    return (
      <main className="page page--narrow">
        <Alert type="error">{loadError}</Alert>
        <Link to="/reservas" className="btn btn--outline">
          Volver a mis reservas
        </Link>
      </main>
    );
  }
  if (!reservation) {
    return (
      <main className="page">
        <Spinner label="Cargando reserva..." />
      </main>
    );
  }

  const isFinished = reservation.status === 'CHECKED_OUT';
  const limitReached = reservation.services.length >= MAX_SERVICES;

  const addService = (service: ServiceCatalogItem) =>
    runAction(
      `service-${service.type}`,
      () => hotelService.addService(reservation.id, service.type),
      `Servicio "${service.name}" agregado a la reserva.`,
    );

  const checkIn = () =>
    runAction('checkin', () => hotelService.checkIn(reservation.id), 'Check-in realizado. Se generó tu llave digital.');

  const checkOut = () => {
    const confirmed = window.confirm(
      '¿Confirmas el check-out? Se generará la factura final y ya no podrás agregar servicios.',
    );
    if (confirmed) {
      void runAction('checkout', () => hotelService.checkOut(reservation.id), 'Check-out realizado. Esta es tu factura final.');
    }
  };

  const isServiceDisabled = (type: ExtraServiceType, repeatable: boolean) =>
    isFinished || limitReached || busyAction !== null || (!repeatable && reservation.services.some((s) => s.type === type));

  return (
    <main className="page">
      <Link to="/reservas" className="no-print">
        ← Mis reservas
      </Link>
      <div className="reservation-row">
        <h1>Reserva {reservation.id}</h1>
        <StatusBadge status={reservation.status} />
      </div>

      {feedback && (
        <Alert type={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      {reservation.invoice && <InvoiceView invoice={reservation.invoice} />}

      <div className="layout-split no-print">
        <div>
          <section className="card">
            <h2>Resumen</h2>
            <dl className="details">
              <dt>Huésped</dt>
              <dd>{reservation.guest.fullName}</dd>
              <dt>Documento</dt>
              <dd>{reservation.guest.documentNumber}</dd>
              <dt>Contacto</dt>
              <dd>
                {reservation.guest.email} · {reservation.guest.phone}
              </dd>
              <dt>Habitación</dt>
              <dd>
                {reservation.roomNumber} · {ROOM_TYPE_LABELS[reservation.roomType]} ·{' '}
                {plural(reservation.guestCount, 'huésped', 'huéspedes')}
              </dd>
              <dt>Fechas</dt>
              <dd>
                {DateUtils.formatDate(reservation.checkIn)} → {DateUtils.formatDate(reservation.checkOut)} (
                {plural(reservation.nights, 'noche', 'noches')})
              </dd>
            </dl>
            <br />
            <PriceBreakdown quote={reservation.roomCharge} />

            <h3 style={{ marginTop: 20 }}>Servicios adicionales</h3>
            {reservation.services.length === 0 ? (
              <p className="muted">Aún no has agregado servicios.</p>
            ) : (
              <table className="summary-table">
                <tbody>
                  {reservation.services.map((service, index) => (
                    <tr key={`${service.type}-${index}`}>
                      <td>
                        {service.name} {service.quantity > 1 && `(× ${service.quantity} días)`}
                      </td>
                      <td className="num">{formatMoney(service.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <table className="summary-table">
              <tfoot>
                <tr>
                  <td>Total {isFinished ? 'facturado' : 'actual'}</td>
                  <td className="num">{formatMoney(reservation.currentTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className="card">
            <h2>Agregar servicios</h2>
            <p className="muted">
              {isFinished
                ? 'La reserva está finalizada; ya no se pueden agregar servicios.'
                : `Puedes agregar hasta ${MAX_SERVICES} servicios. Spa y traslado se pueden repetir; el desayuno se agrega una sola vez y se cobra por cada día.`}
            </p>
            <div className="grid grid--3">
              {catalog.map((service) => {
                const perNight = service.chargeMode === 'PER_NIGHT';
                const total = perNight ? service.unitPrice * reservation.nights : service.unitPrice;
                return (
                  <article className="service-card" key={service.type}>
                    <strong>{service.name}</strong>
                    <span className="muted">{SERVICE_DESCRIPTIONS[service.type]}</span>
                    <span>
                      {formatMoney(service.unitPrice)} {CHARGE_MODE_LABELS[service.chargeMode]}
                      {perNight && ` → ${formatMoney(total)} por ${plural(reservation.nights, 'día', 'días')}`}
                    </span>
                    <button
                      type="button"
                      className="btn btn--outline btn--small"
                      disabled={isServiceDisabled(service.type, service.repeatable)}
                      onClick={() => void addService(service)}
                    >
                      {busyAction === `service-${service.type}` ? 'Agregando...' : 'Agregar'}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="card">
          <h2>Acceso a la habitación</h2>
          {reservation.status === 'CONFIRMED' && (
            <>
              <p>Al hacer check-in se genera la llave digital de la habitación {reservation.roomNumber}.</p>
              <button type="button" className="btn btn--primary btn--block" disabled={busyAction !== null} onClick={() => void checkIn()}>
                {busyAction === 'checkin' ? 'Procesando...' : 'Realizar check-in'}
              </button>
            </>
          )}

          {reservation.status === 'CHECKED_IN' && (
            <>
              <p>Llave digital activa para la habitación {reservation.roomNumber}:</p>
              <div className="digital-key" aria-label="Llave digital">
                {reservation.digitalKey}
              </div>
              {reservation.checkedInAt && <p className="muted">Check-in: {DateUtils.formatDateTime(reservation.checkedInAt)}</p>}
              <p>Al hacer check-out se calcula el cobro final, se desactiva la llave y se genera la factura.</p>
              <button type="button" className="btn btn--accent btn--block" disabled={busyAction !== null} onClick={checkOut}>
                {busyAction === 'checkout' ? 'Procesando...' : 'Realizar check-out'}
              </button>
            </>
          )}

          {reservation.status === 'CHECKED_OUT' && (
            <>
              <p>La estadía finalizó y la llave digital fue desactivada.</p>
              {reservation.checkedOutAt && (
                <p className="muted">Check-out: {DateUtils.formatDateTime(reservation.checkedOutAt)}</p>
              )}
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
