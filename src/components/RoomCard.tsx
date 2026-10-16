import type { AvailableRoom } from '../models/hotel';
import { formatMoney, plural } from '../utils/format';
import { ROOM_TYPE_DESCRIPTIONS, ROOM_TYPE_LABELS } from '../utils/labels';

interface RoomCardProps {
  room: AvailableRoom;
  selected: boolean;
  onSelect: (room: AvailableRoom) => void;
}

export function RoomCard({ room, selected, onSelect }: RoomCardProps) {
  return (
    <article className={`room-card ${selected ? 'room-card--selected' : ''}`}>
      <div className="room-card__header">
        <span className="room-card__number">Hab. {room.number}</span>
        <span className="badge badge--CONFIRMED">{ROOM_TYPE_LABELS[room.type]}</span>
      </div>
      <p className="muted">{ROOM_TYPE_DESCRIPTIONS[room.type]}</p>
      <p>
        Piso {room.floor} · Máximo {plural(room.maxGuests, 'huésped', 'huéspedes')}
      </p>
      <div>
        <span className="room-card__price">{formatMoney(room.quote.total)}</span>
        <span className="muted"> por {plural(room.quote.nights, 'noche', 'noches')}</span>
      </div>
      <button
        type="button"
        className={`btn ${selected ? 'btn--primary' : 'btn--outline'}`}
        onClick={() => onSelect(room)}
        aria-pressed={selected}
      >
        {selected ? 'Seleccionada' : 'Seleccionar'}
      </button>
    </article>
  );
}
