import type { ApiClient } from '../api/ApiClient';
import type { AuthResponse, LoginData, RegisterData, Session } from '../models/auth';

/**
 * Registration and login against /api/auth.
 */
export class AuthService {
  constructor(private readonly api: ApiClient) {}

  async register(data: RegisterData): Promise<Session> {
    const response = await this.api.post<AuthResponse>('/api/auth/register', {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      password: data.password,
    });
    return AuthService.toSession(response);
  }

  async login(data: LoginData): Promise<Session> {
    const response = await this.api.post<AuthResponse>('/api/auth/login', {
      email: data.email.trim(),
      password: data.password,
    });
    return AuthService.toSession(response);
  }

  private static toSession(response: AuthResponse): Session {
    return {
      token: response.token,
      expiresAt: response.expiresAt,
      fullName: response.fullName,
      email: response.email,
    };
  }
}
