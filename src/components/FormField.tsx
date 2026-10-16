import type { ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  /** Explains what to type and the limits of the field. */
  hint?: string;
  error?: string;
  /** Shows "current / max" characters. */
  counter?: { current: number; max: number };
  children: ReactNode;
}

/**
 * Label + input + help text + error message, with the same look in every form.
 */
export function FormField({ id, label, hint, error, counter, children }: FormFieldProps) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <div className="field__header">
        <label htmlFor={id}>{label}</label>
        {counter && (
          <span className="field__counter" aria-live="polite">
            {counter.current}/{counter.max}
          </span>
        )}
      </div>
      {children}
      {hint && !error && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
