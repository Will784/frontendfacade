import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppError } from '../api/AppError';
import { Alert } from '../components/Alert';
import { FormField } from '../components/FormField';
import { PriceBreakdown } from '../components/PriceBreakdown';
import { useAuth } from '../context/AuthContext';
import type { Guest } from '../models/hotel';
import { hotelService } from '../services';
import { DateUtils } from '../utils/DateUtils';
import { plural } from '../utils/format';
import { ROOM_TYPE_LABELS } from '../utils/labels';
import { LIMITS } from '../validation/limits';
import { Validator, type FieldErrors } from '../validation/Validator';
import type { BookingState } from './SearchPage';

type GuestForm = Guest & { guestCount: string };

function validate(form: GuestForm, maxGuests: number): FieldErrors<GuestForm> {
  const guests = Number(form.guestCount);
  return {
    fullName: Validator.personName(form.fullName) ?? undefined,
    documentNumber:
      Validator.digits(form.documentNumber, 'El documento', LIMITS.document.min, LIMITS.document.max) ?? undefined,
    email: Validator.email(form.email) ?? undefined,
    phone: Validator.digits(form.phone, 'El teléfono', LIMITS.phone.min, LIMITS.phone.max) ?? undefined,
    guestCount:
      Number.isInteger(guests) && guests >= 1 && guests <= maxGuests
        ? undefined
        : `Selecciona entre 1 y ${maxGuests} huéspedes.`,
  };
}

/** The server answers field errors as "guest.fullName"; this maps them to the form fields. */
function mapServerFieldErrors(fieldErrors: Record<string, string>): FieldErrors<GuestForm> {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, message]) => [field.replace(/^guest\./, ''), message]),
  ) as FieldErrors<GuestForm>;
}

const onlyDigits = (value: string) => value.replace(/\D/g, '');

/**
 * Reservation form with the guest data. It receives the selected room from the search page.
 */
export function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const booking = location.state as BookingState | null;

  const [form, setForm] = useState<GuestForm>({
    fullName: session?.fullName ?? '',
    documentNumber: '',
    email: session?.email ?? '',
    phone: '',
    guestCount: '1',
  });
  const [errors, setErrors] = useState<FieldErrors<GuestForm>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!booking) {
    return <Navigate to="/" replace />;
  }
  const { room, checkIn, checkOut } = booking;

  const update = (field: keyof GuestForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const validation = validate(form, room.maxGuests);
    setErrors(validation);
    if (Validator.hasErrors(validation)) return;

    setSubmitting(true);
    try {
      const reservation = await hotelService.createReservation({
        roomNumber: room.number,
        checkIn,
        checkOut,
        guestCount: Number(form.guestCount),
        guest: {
          fullName: form.fullName.trim(),
          documentNumber: form.documentNumber,
          email: form.email.trim(),
          phone: form.phone,
        },
      });
      navigate(`/reservas/${reservation.id}`, { replace: true, state: { created: true } });
    } catch (error) {
      if (error instanceof AppError) {
        setErrors((current) => ({ ...current, ...mapServerFieldErrors(error.fieldErrors) }));
      }
      setServerError(AppError.messageOf(error));
    } finally {
      setSubmitting(false);
    }
  };

  const backToSearch = `/?checkIn=${checkIn}&checkOut=${checkOut}`;

  return (
    <main className="page">
      <div className="steps">
        <span>1. Buscar</span>›<span>2. Seleccionar</span>›<span className="steps__item--active">3. Datos del huésped</span>
      </div>
      <h1>Datos de la reserva</h1>

      <div className="layout-split">
        <section className="card">
          <h2>Huésped principal</h2>
          <p className="muted">Todos los campos son obligatorios.</p>
          {serverError && <Alert type="error">{serverError}</Alert>}

          <form onSubmit={handleSubmit} noValidate>
            <FormField
              id="fullName"
              label="Nombre completo"
              hint={`Como aparece en el documento. Entre ${LIMITS.name.min} y ${LIMITS.name.max} caracteres, solo letras.`}
              error={errors.fullName}
              counter={{ current: form.fullName.length, max: LIMITS.name.max }}
            >
              <input
                id="fullName"
                autoComplete="name"
                maxLength={LIMITS.name.max}
                value={form.fullName}
                onChange={(event) => update('fullName', event.target.value)}
              />
            </FormField>

            <div className="grid grid--2">
              <FormField
                id="documentNumber"
                label="Número de documento"
                hint={`Entre ${LIMITS.document.min} y ${LIMITS.document.max} dígitos, sin puntos ni espacios.`}
                error={errors.documentNumber}
                counter={{ current: form.documentNumber.length, max: LIMITS.document.max }}
              >
                <input
                  id="documentNumber"
                  inputMode="numeric"
                  maxLength={LIMITS.document.max}
                  placeholder="Ej: 1020304050"
                  value={form.documentNumber}
                  onChange={(event) => update('documentNumber', onlyDigits(event.target.value))}
                />
              </FormField>

              <FormField
                id="phone"
                label="Teléfono"
                hint={`Entre ${LIMITS.phone.min} y ${LIMITS.phone.max} dígitos, solo números.`}
                error={errors.phone}
                counter={{ current: form.phone.length, max: LIMITS.phone.max }}
              >
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={LIMITS.phone.max}
                  placeholder="Ej: 3001234567"
                  value={form.phone}
                  onChange={(event) => update('phone', onlyDigits(event.target.value))}
                />
              </FormField>
            </div>

            <div className="grid grid--2">
              <FormField
                id="email"
                label="Correo del huésped"
                hint={`Máximo ${LIMITS.email.max} caracteres.`}
                error={errors.email}
              >
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  maxLength={LIMITS.email.max}
                  value={form.email}
                  onChange={(event) => update('email', event.target.value)}
                />
              </FormField>

              <FormField
                id="guestCount"
                label="Número de huéspedes"
                hint={`Esta habitación admite máximo ${plural(room.maxGuests, 'persona', 'personas')}.`}
                error={errors.guestCount}
              >
                <select id="guestCount" value={form.guestCount} onChange={(event) => update('guestCount', event.target.value)}>
                  {Array.from({ length: room.maxGuests }, (_, index) => index + 1).map((count) => (
                    <option key={count} value={count}>
                      {plural(count, 'huésped', 'huéspedes')}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="actions">
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? 'Confirmando...' : 'Confirmar reserva'}
              </button>
              <Link to={backToSearch} className="btn btn--outline">
                Cambiar habitación
              </Link>
            </div>
          </form>
        </section>

        <aside className="card">
          <h2>Resumen</h2>
          <dl className="details">
            <dt>Habitación</dt>
            <dd>
              {room.number} · {ROOM_TYPE_LABELS[room.type]}
            </dd>
            <dt>Entrada</dt>
            <dd>{DateUtils.formatDate(checkIn)}</dd>
            <dt>Salida</dt>
            <dd>{DateUtils.formatDate(checkOut)}</dd>
          </dl>
          <br />
          <PriceBreakdown quote={room.quote} />
        </aside>
      </div>
    </main>
  );
}
