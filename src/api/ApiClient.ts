import { AppError } from './AppError';

type HttpMethod = 'GET' | 'POST' | 'PUT';

/** Shape of the error body sent by the backend. */
interface ApiErrorBody {
  message?: unknown;
  fieldErrors?: unknown;
}

/**
 * Small HTTP client on top of fetch.
 * - Adds the JWT token to each request.
 * - Converts every failure into an AppError with a friendly message,
 *   so no technical detail ever reaches the screen.
 */
export class ApiClient {
  /** Render's free plan can take up to a minute to wake up. */
  private static readonly TIMEOUT_MS = 70_000;

  private readonly baseUrl: string;
  private readonly getToken: () => string | null;
  private readonly onUnauthorized: () => void;

  constructor(baseUrl: string, getToken: () => string | null, onUnauthorized: () => void) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.getToken = getToken;
    this.onUnauthorized = onUnauthorized;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  private async request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
    const response = await this.send(method, path, body);

    if (response.ok) {
      return this.readJson<T>(response);
    }

    const error = await this.toAppError(response);
    if (error.isUnauthorized && this.getToken()) {
      this.onUnauthorized();
    }
    throw error;
  }

  private async send(method: HttpMethod, path: string, body?: unknown): Promise<Response> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), ApiClient.TIMEOUT_MS);

    try {
      return await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch {
      throw new AppError(
        'No fue posible conectar con el servidor. Revisa tu conexión e intenta de nuevo ' +
          '(la primera conexión puede tardar hasta un minuto).',
      );
    } finally {
      window.clearTimeout(timeout);
    }
  }

  private async readJson<T>(response: Response): Promise<T> {
    try {
      return (await response.json()) as T;
    } catch {
      throw new AppError(AppError.GENERIC_MESSAGE, response.status);
    }
  }

  /** Only the server's friendly message is used; server errors (5xx) always get a generic text. */
  private async toAppError(response: Response): Promise<AppError> {
    if (response.status >= 500) {
      return new AppError('El servidor no pudo procesar la solicitud. Intenta más tarde.', response.status);
    }

    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      // Body is not JSON: the generic message is used.
    }

    const message = typeof body.message === 'string' ? body.message : AppError.GENERIC_MESSAGE;
    return new AppError(message, response.status, ApiClient.readFieldErrors(body.fieldErrors));
  }

  private static readFieldErrors(value: unknown): Record<string, string> {
    if (!value || typeof value !== 'object') {
      return {};
    }
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
    );
  }
}
