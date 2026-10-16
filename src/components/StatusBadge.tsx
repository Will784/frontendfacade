import type { ReservationStatus } from '../models/hotel';
import { STATUS_LABELS } from '../utils/labels';

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return <span className={`badge badge--${status}`}>{STATUS_LABELS[status]}</span>;
}
