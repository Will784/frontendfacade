import type { Session } from '../models/auth';

/**
 * Keeps the logged-in session in the browser's localStorage.
 * Expired or damaged sessions are discarded automatically.
 */
export class SessionStore {
  private static readonly KEY = 'hotel-facade-session';

  load(): Session | null {
    try {
      const raw = window.localStorage.getItem(SessionStore.KEY);
      if (!raw) {
        return null;
      }
      const session = JSON.parse(raw) as Session;
      if (!session.token || this.isExpired(session)) {
        this.clear();
        return null;
      }
      return session;
    } catch {
      this.clear();
      return null;
    }
  }

  save(session: Session): void {
    try {
      window.localStorage.setItem(SessionStore.KEY, JSON.stringify(session));
    } catch {
      // Storage not available (private mode): the session lives only in memory.
    }
  }

  clear(): void {
    try {
      window.localStorage.removeItem(SessionStore.KEY);
    } catch {
      // Nothing to clear.
    }
  }

  isExpired(session: Session): boolean {
    return new Date(session.expiresAt).getTime() <= Date.now();
  }
}
