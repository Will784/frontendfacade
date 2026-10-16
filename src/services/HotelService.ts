import type { ApiClient } from '../api/ApiClient';
import type {
  AvailabilitySearch,
  AvailableRoom,
  ExtraServiceType,
  Reservation,
  ReservationRequest,
  ServiceCatalogItem,
} from '../models/hotel';

/**
 * Calls to the hotel API. The backend exposes these operations through its HotelFacade.
 */
export class HotelService {
  constructor(private readonly api: ApiClient) {}

  searchAvailability(search: AvailabilitySearch): Promise<AvailableRoom[]> {
    const params = new URLSearchParams({ checkIn: search.checkIn, checkOut: search.checkOut });
    if (search.type) {
      params.set('type', search.type);
    }
    return this.api.get<AvailableRoom[]>(`/api/hotel/disponibilidad?${params.toString()}`);
  }

  createReservation(request: ReservationRequest): Promise<Reservation> {
    return this.api.post<Reservation>('/api/hotel/reservar', request);
  }

  getReservation(id: string): Promise<Reservation> {
    return this.api.get<Reservation>(`/api/hotel/reserva/${encodeURIComponent(id)}`);
  }

  getMyReservations(): Promise<Reservation[]> {
    return this.api.get<Reservation[]>('/api/hotel/reservas');
  }

  getServiceCatalog(): Promise<ServiceCatalogItem[]> {
    return this.api.get<ServiceCatalogItem[]>('/api/hotel/catalogo-servicios');
  }

  addService(reservationId: string, serviceType: ExtraServiceType): Promise<Reservation> {
    return this.api.post<Reservation>(`/api/hotel/servicios/${encodeURIComponent(reservationId)}`, {
      serviceType,
    });
  }

  checkIn(reservationId: string): Promise<Reservation> {
    return this.api.put<Reservation>(`/api/hotel/checkin/${encodeURIComponent(reservationId)}`);
  }

  checkOut(reservationId: string): Promise<Reservation> {
    return this.api.put<Reservation>(`/api/hotel/checkout/${encodeURIComponent(reservationId)}`);
  }
}
