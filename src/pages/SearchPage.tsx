import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppError } from '../api/AppError';
import { Alert } from '../components/Alert';
import { FormField } from '../components/FormField';
import { PriceBreakdown } from '../components/PriceBreakdown';
import { RoomCard } from '../components/RoomCard';
import { Spinner } from '../components/Spinner';
import type { AvailabilitySearch, AvailableRoom, RoomType } from '../models/hotel';
import { hotelService } from '../services';
import { DateUtils } from '../utils/DateUtils';
import { ROOM_TYPE_LABELS } from '../utils/labels';
import { LIMITS } from '../validation/limits';
import { Validator } from '../validation/Validator';

const ROOM_TYPES = Object.keys(ROOM_TYPE_LABELS) as RoomType[];

interface SearchForm {
  checkIn: string;
  checkOut: string;
  type: RoomType | '';
}

export interface BookingState {
  room: AvailableRoom;
  checkIn: string;
  checkOut: string;
}

/**
 * Room search by dates. The search is saved in the URL so it is kept when the user goes back.
 */
export function SearchPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const today = DateUtils.today();

  const [form, setForm] = useState<SearchForm>(() => ({
    checkIn: params.get('checkIn') ?? today,
    checkOut: params.get('checkOut') ?? DateUtils.addDays(today, 1),
    type: (ROOM_TYPES as string[]).includes(params.get('type') ?? '') ? (params.get('type') as RoomType) : '',
  }));
  const [errors, setErrors] = useState<{ checkIn?: string; checkOut?: string }>({});
  const [rooms, setRooms] = useState<AvailableRoom[] | null>(null);
  const [selected, setSelected] = useState<AvailableRoom | null>(null);
  const [searched, setSearched] = useState<AvailabilitySearch | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const runSearch = useCallback(async (search: AvailabilitySearch) => {
    setLoading(true);
    setServerError(null);
    setSelected(null);
    try {
      setRooms(await hotelService.searchAvailability(search));
      setSearched(search);
    } catch (error) {
      setRooms(null);
      setServerError(AppError.messageOf(error));
    } finally {
      setLoading(false);
    }
  }, []);

  // Repeats the search saved in the URL (for example, when coming back from the booking form).
  useEffect(() => {
    const checkIn = params.get('checkIn');
    const checkOut = params.get('checkOut');
    if (checkIn && checkOut && !Validator.hasErrors(Validator.stayDates(checkIn, checkOut))) {
      const type = params.get('type') as RoomType | null;
      void runSearch({ checkIn, checkOut, type: type ?? undefined });
    }
    // Only on the first render (runSearch and params are read once on purpose).
  }, []);

  const updateCheckIn = (checkIn: string) => {
    setForm((current) => ({
      ...current,
      checkIn,
      // Keeps check-out after check-in automatically.
      checkOut: checkIn && current.checkOut <= checkIn ? DateUtils.addDays(checkIn, 1) : current.checkOut,
    }));
    setErrors({});
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = Validator.stayDates(form.checkIn, form.checkOut);
    setErrors(validation);
    if (Validator.hasErrors(validation)) return;

    const search: AvailabilitySearch = { checkIn: form.checkIn, checkOut: form.checkOut, type: form.type || undefined };
    const query: Record<string, string> = { checkIn: search.checkIn, checkOut: search.checkOut };
    if (search.type) query.type = search.type;
    setParams(query, { replace: true });
    void runSearch(search);
  };

  const continueBooking = () => {
    if (!selected || !searched) return;
    const state: BookingState = { room: selected, checkIn: searched.checkIn, checkOut: searched.checkOut };
    navigate('/reservar', { state });
  };

  const nights = form.checkIn && form.checkOut > form.checkIn ? DateUtils.nightsBetween(form.checkIn, form.checkOut) : 0;
  const maxCheckIn = DateUtils.addDays(today, LIMITS.stay.maxDaysInAdvance);

  return (
    <main className="page">
      <h1>Buscar habitaciones</h1>
      <p className="muted">
        Elige las fechas de tu estadía para ver las habitaciones disponibles y su precio. Temporada alta (junio,
        julio, diciembre y enero): el precio por noche aumenta ×1.5.
      </p>

      <section className="card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid--3">
            <FormField
              id="checkIn"
              label="Fecha de entrada"
              hint="Desde hoy y hasta un año de anticipación."
              error={errors.checkIn}
            >
              <input
                id="checkIn"
                type="date"
                min={today}
                max={maxCheckIn}
                value={form.checkIn}
                onChange={(event) => updateCheckIn(event.target.value)}
              />
            </FormField>

            <FormField
              id="checkOut"
              label="Fecha de salida"
              hint={`Máximo ${LIMITS.stay.maxNights} noches. ${nights ? `Seleccionadas: ${nights}.` : ''}`}
              error={errors.checkOut}
            >
              <input
                id="checkOut"
                type="date"
                min={form.checkIn ? DateUtils.addDays(form.checkIn, 1) : today}
                max={form.checkIn ? DateUtils.addDays(form.checkIn, LIMITS.stay.maxNights) : undefined}
                value={form.checkOut}
                onChange={(event) => {
                  setForm((current) => ({ ...current, checkOut: event.target.value }));
                  setErrors({});
                }}
              />
            </FormField>

            <FormField id="type" label="Tipo de habitación" hint="Opcional: filtra por un tipo.">
              <select
                id="type"
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as RoomType | '' }))}
              >
                <option value="">Todos los tipos</option>
                {ROOM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {ROOM_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar disponibilidad'}
          </button>
        </form>
      </section>

      {serverError && <Alert type="error">{serverError}</Alert>}
      {loading && <Spinner label="Consultando disponibilidad..." />}

      {!loading && rooms && searched && (
        <div className="layout-split">
          <section>
            <h2>
              {rooms.length} {rooms.length === 1 ? 'habitación disponible' : 'habitaciones disponibles'}
            </h2>
            <p className="muted">
              {DateUtils.formatDate(searched.checkIn)} → {DateUtils.formatDate(searched.checkOut)}
            </p>
            {rooms.length === 0 ? (
              <div className="card empty-state">
                No hay habitaciones libres para esas fechas. Prueba con otras fechas u otro tipo.
              </div>
            ) : (
              <div className="grid grid--2">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.number}
                    room={room}
                    selected={selected?.number === room.number}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="card">
            <h2>Vista previa del precio</h2>
            {selected ? (
              <>
                <p>
                  Habitación <strong>{selected.number}</strong> ({ROOM_TYPE_LABELS[selected.type]})
                </p>
                <PriceBreakdown quote={selected.quote} />
                <p className="muted">Los servicios adicionales (spa, desayuno, traslado) se agregan después de reservar.</p>
                <button type="button" className="btn btn--accent btn--block" onClick={continueBooking}>
                  Continuar con la reserva
                </button>
              </>
            ) : (
              <p className="muted">Selecciona una habitación para ver el detalle del precio.</p>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
