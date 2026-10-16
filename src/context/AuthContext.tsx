import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LoginData, RegisterData, Session } from '../models/auth';
import { authService, SESSION_EXPIRED_EVENT, sessionStore } from '../services';

interface AuthContextValue {
  session: Session | null;
  /** Message to show on the login page (for example, when the session expired). */
  notice: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: (notice?: string) => void;
  clearNotice: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const EXPIRED_MESSAGE = 'Tu sesión expiró. Inicia sesión nuevamente.';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => sessionStore.load());
  const [notice, setNotice] = useState<string | null>(null);

  const startSession = useCallback((newSession: Session) => {
    sessionStore.save(newSession);
    setSession(newSession);
    setNotice(null);
  }, []);

  const logout = useCallback((message?: string) => {
    sessionStore.clear();
    setSession(null);
    setNotice(message ?? null);
  }, []);

  // The API client fires this event when the server answers 401.
  useEffect(() => {
    const onExpired = () => logout(EXPIRED_MESSAGE);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [logout]);

  // Logs out automatically when the token reaches its expiration time.
  useEffect(() => {
    if (!session) return undefined;
    const remaining = new Date(session.expiresAt).getTime() - Date.now();
    const timer = window.setTimeout(() => logout(EXPIRED_MESSAGE), Math.max(remaining, 0));
    return () => window.clearTimeout(timer);
  }, [session, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      notice,
      login: async (data) => startSession(await authService.login(data)),
      register: async (data) => startSession(await authService.register(data)),
      logout,
      clearNotice: () => setNotice(null),
    }),
    [session, notice, startSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
