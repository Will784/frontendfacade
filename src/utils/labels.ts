import type { ChargeMode, ExtraServiceType, ReservationStatus, RoomType } from '../models/hotel';

/** Spanish texts for the values that come from the API. */
export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  SINGLE: 'Sencilla',
  DOUBLE: 'Doble',
  SUITE: 'Suite',
};

export const ROOM_TYPE_DESCRIPTIONS: Record<RoomType, string> = {
  SINGLE: 'Cama sencilla, ideal para una persona.',
  DOUBLE: 'Cama doble o dos camas, para dos personas.',
  SUITE: 'Habitación amplia con sala, hasta cuatro personas.',
};

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  CONFIRMED: 'Confirmada',
  CHECKED_IN: 'Hospedado (check-in)',
  CHECKED_OUT: 'Finalizada (check-out)',
};

export const SERVICE_DESCRIPTIONS: Record<ExtraServiceType, string> = {
  SPA: 'Sesión de spa y relajación.',
  BREAKFAST: 'Desayuno buffet todos los días de la estadía.',
  TRANSFER: 'Traslado entre el aeropuerto y el hotel.',
};

export const CHARGE_MODE_LABELS: Record<ChargeMode, string> = {
  ONE_TIME: 'por uso',
  PER_NIGHT: 'por día',
};
