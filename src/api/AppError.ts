/**
 * Error that is safe to show to the user: it only carries a friendly message in Spanish
 * and, for forms, the message of each invalid field. It never contains technical details.
 */
export class AppError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, status = 0, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** Converts any unknown error into a friendly message. */
  static messageOf(error: unknown): string {
    return error instanceof AppError ? error.message : AppError.GENERIC_MESSAGE;
  }

  static readonly GENERIC_MESSAGE = 'Ocurrió un error inesperado. Intenta nuevamente.';
}
