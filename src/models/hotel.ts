export type RoomType = 'SINGLE' | 'DOUBLE' | 'SUITE';
export type ReservationStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT';
export type ExtraServiceType = 'SPA' | 'BREAKFAST' | 'TRANSFER';
export type ChargeMode = 'ONE_TIME' | 'PER_NIGHT';

export interface PriceQuote {
  roomType: RoomType;
  nights: number;
  lowSeasonNights: number;
  lowSeasonPrice: number;
  highSeasonNights: number;
  highSeasonPrice: number;
  total: number;
}

export interface AvailableRoom {
  number: string;
  type: RoomType;
  typeName: string;
  floor: number;
  maxGuests: number;
  quote: PriceQuote;
}

export interface Guest {
  fullName: string;
  documentNumber: string;
  email: string;
  phone: string;
}

export interface ReservationRequest {
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  guest: Guest;
}

export interface AddedService {
  type: ExtraServiceType;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
  addedAt: string;
}

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  number: string;
  reservationId: string;
  issuedAt: string;
  guestName: string;
  lines: InvoiceLine[];
  roomSubtotal: number;
  servicesSubtotal: number;
  total: number;
}

export interface Reservation {
  id: string;
  status: ReservationStatus;
  roomNumber: string;
  roomType: RoomType;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestCount: number;
  guest: Guest;
  roomCharge: PriceQuote;
  services: AddedService[];
  servicesTotal: number;
  currentTotal: number;
  digitalKey: string | null;
  createdAt: string;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  invoice: Invoice | null;
}

export interface ServiceCatalogItem {
  type: ExtraServiceType;
  name: string;
  unitPrice: number;
  chargeMode: ChargeMode;
  repeatable: boolean;
}

export interface AvailabilitySearch {
  checkIn: string;
  checkOut: string;
  type?: RoomType;
}
