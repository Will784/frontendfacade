/**
 * Limits shared by the forms. They are the same rules the backend validates,
 * so the user sees them before sending the data.
 */
export const LIMITS = {
  name: { min: 3, max: 60 },
  email: { max: 100 },
  password: { min: 8, max: 64 },
  document: { min: 6, max: 12 },
  phone: { min: 7, max: 15 },
  stay: { maxNights: 30, maxDaysInAdvance: 365 },
} as const;

export const PATTERNS = {
  personName: /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+( [A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  digits: /^\d+$/,
  lowercase: /[a-z]/,
  uppercase: /[A-Z]/,
  digit: /\d/,
  whitespace: /\s/,
} as const;
