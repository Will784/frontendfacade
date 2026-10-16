import { ApiClient } from '../api/ApiClient';
import { AuthService } from './AuthService';
import { HotelService } from './HotelService';
import { SessionStore } from './SessionStore';

/** Event fired when the server rejects the token; AuthContext listens to it to log out. */
export const SESSION_EXPIRED_EVENT = 'hotel-facade:session-expired';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export const sessionStore = new SessionStore();

const apiClient = new ApiClient(
  API_URL,
  () => sessionStore.load()?.token ?? null,
  () => window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT)),
);

export const authService = new AuthService(apiClient);
export const hotelService = new HotelService(apiClient);
