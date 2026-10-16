import { LIMITS, PATTERNS } from './limits';
import { DateUtils } from '../utils/DateUtils';

/** Field name -> error message. An empty object means the form is valid. */
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/**
 * Reusable validation rules. Each method returns the error message, or null when the value is valid.
 */
export class Validator {
  static required(value: string, label: string): string | null {
    return value.trim() ? null : `${label} es obligatorio.`;
  }

  static personName(value: string): string | null {
    const name = value.trim();
    if (!name) return 'El nombre es obligatorio.';
    if (name.length < LIMITS.name.min || name.length > LIMITS.name.max) {
      return `El nombre debe tener entre ${LIMITS.name.min} y ${LIMITS.name.max} caracteres.`;
    }
    if (!PATTERNS.personName.test(name)) return 'Solo se permiten letras y un espacio entre palabras.';
    return null;
  }

  static email(value: string): string | null {
    const email = value.trim();
    if (!email) return 'El correo es obligatorio.';
    if (email.length > LIMITS.email.max) return `El correo no puede superar ${LIMITS.email.max} caracteres.`;
    if (!PATTERNS.email.test(email)) return 'Escribe un correo válido, por ejemplo nombre@correo.com.';
    return null;
  }

  static strongPassword(value: string): string | null {
    if (!value) return 'La contraseña es obligatoria.';
    const unmet = Validator.passwordChecks(value).filter((check) => !check.passed);
    return unmet.length ? 'La contraseña no cumple todos los requisitos.' : null;
  }

  /** List of password requirements, used to show a live checklist under the field. */
  static passwordChecks(value: string): { label: string; passed: boolean }[] {
    return [
      {
        label: `Entre ${LIMITS.password.min} y ${LIMITS.password.max} caracteres`,
        passed: value.length >= LIMITS.password.min && value.length <= LIMITS.password.max,
      },
      { label: 'Una letra mayúscula', passed: PATTERNS.uppercase.test(value) },
      { label: 'Una letra minúscula', passed: PATTERNS.lowercase.test(value) },
      { label: 'Un número', passed: PATTERNS.digit.test(value) },
      { label: 'Sin espacios', passed: value.length > 0 && !PATTERNS.whitespace.test(value) },
    ];
  }

  static digits(value: string, label: string, min: number, max: number): string | null {
    if (!value) return `${label} es obligatorio.`;
    if (!PATTERNS.digits.test(value)) return `${label} solo puede contener números.`;
    if (value.length < min || value.length > max) return `${label} debe tener entre ${min} y ${max} dígitos.`;
    return null;
  }

  /** Rules of the hotel: no past dates, at most one year in advance and at most 30 nights. */
  static stayDates(checkIn: string, checkOut: string): { checkIn?: string; checkOut?: string } {
    const errors: { checkIn?: string; checkOut?: string } = {};
    const today = DateUtils.today();

    if (!checkIn) errors.checkIn = 'Selecciona la fecha de entrada.';
    else if (checkIn < today) errors.checkIn = 'La fecha de entrada no puede ser anterior a hoy.';
    else if (checkIn > DateUtils.addDays(today, LIMITS.stay.maxDaysInAdvance)) {
      errors.checkIn = 'Solo se puede reservar con máximo un año de anticipación.';
    }

    if (!checkOut) errors.checkOut = 'Selecciona la fecha de salida.';
    else if (checkIn && checkOut <= checkIn) errors.checkOut = 'La salida debe ser posterior a la entrada.';
    else if (checkIn && DateUtils.nightsBetween(checkIn, checkOut) > LIMITS.stay.maxNights) {
      errors.checkOut = `La estadía no puede superar ${LIMITS.stay.maxNights} noches.`;
    }
    return errors;
  }

  static hasErrors<T>(errors: FieldErrors<T>): boolean {
    return Object.values(errors).some(Boolean);
  }
}
