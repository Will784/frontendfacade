export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/** Response of /api/auth/login and /api/auth/register. */
export interface AuthResponse {
  token: string;
  expiresAt: string;
  fullName: string;
  email: string;
}

/** Logged-in user kept in the browser. */
export interface Session {
  token: string;
  expiresAt: string;
  fullName: string;
  email: string;
}
