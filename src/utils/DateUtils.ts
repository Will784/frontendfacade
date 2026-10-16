/**
 * Helpers for dates in ISO format (YYYY-MM-DD), the format used by the API and by <input type="date">.
 */
export class DateUtils {
  private static readonly DAY_MS = 24 * 60 * 60 * 1000;

  /** Today's date in the user's local time. */
  static today(): string {
    return DateUtils.toIso(new Date());
  }

  static addDays(isoDate: string, days: number): string {
    const date = DateUtils.parse(isoDate);
    date.setDate(date.getDate() + days);
    return DateUtils.toIso(date);
  }

  static nightsBetween(checkIn: string, checkOut: string): number {
    return Math.round((DateUtils.parse(checkOut).getTime() - DateUtils.parse(checkIn).getTime()) / DateUtils.DAY_MS);
  }

  /** "2026-12-20" -> "dom, 20 dic 2026" */
  static formatDate(isoDate: string): string {
    return DateUtils.parse(isoDate).toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  static formatDateTime(isoDateTime: string): string {
    return new Date(isoDateTime).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  }

  private static parse(isoDate: string): Date {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private static toIso(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
