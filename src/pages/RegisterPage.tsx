import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppError } from '../api/AppError';
import { Alert } from '../components/Alert';
import { FormField } from '../components/FormField';
import { PasswordInput } from '../components/PasswordInput';
import { useAuth } from '../context/AuthContext';
import { LIMITS } from '../validation/limits';
import { Validator, type FieldErrors } from '../validation/Validator';

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function validate(form: RegisterForm): FieldErrors<RegisterForm> {
  return {
    fullName: Validator.personName(form.fullName) ?? undefined,
    email: Validator.email(form.email) ?? undefined,
    password: Validator.strongPassword(form.password) ?? undefined,
    confirmPassword: !form.confirmPassword
      ? 'Confirma tu contraseña.'
      : form.confirmPassword !== form.password
        ? 'Las contraseñas no coinciden.'
        : undefined,
  };
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FieldErrors<RegisterForm>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof RegisterForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const validation = validate(form);
    setErrors(validation);
    if (Validator.hasErrors(validation)) return;

    setSubmitting(true);
    try {
      await register({ fullName: form.fullName, email: form.email, password: form.password });
      navigate('/', { replace: true });
    } catch (error) {
      if (error instanceof AppError) {
        setErrors((current) => ({ ...current, ...error.fieldErrors }));
      }
      setServerError(AppError.messageOf(error));
    } finally {
      setSubmitting(false);
    }
  };

  const passwordChecks = Validator.passwordChecks(form.password);

  return (
    <main className="page page--narrow">
      <section className="card">
        <h1>Crear cuenta</h1>
        <p className="muted">Regístrate para poder reservar habitaciones. Todos los campos son obligatorios.</p>

        {serverError && <Alert type="error">{serverError}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            id="fullName"
            label="Nombre completo"
            hint={`Entre ${LIMITS.name.min} y ${LIMITS.name.max} caracteres. Solo letras y espacios.`}
            error={errors.fullName}
            counter={{ current: form.fullName.length, max: LIMITS.name.max }}
          >
            <input
              id="fullName"
              autoComplete="name"
              maxLength={LIMITS.name.max}
              placeholder="Ej: Ana María Gómez"
              value={form.fullName}
              onChange={(event) => update('fullName', event.target.value)}
            />
          </FormField>

          <FormField
            id="email"
            label="Correo electrónico"
            hint={`Máximo ${LIMITS.email.max} caracteres. Lo usarás para iniciar sesión.`}
            error={errors.email}
          >
            <input
              id="email"
              type="email"
              autoComplete="email"
              maxLength={LIMITS.email.max}
              placeholder="nombre@correo.com"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
            />
          </FormField>

          <FormField id="password" label="Contraseña" error={errors.password}>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              maxLength={LIMITS.password.max}
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
            />
          </FormField>
          <ul className="checklist" aria-label="Requisitos de la contraseña">
            {passwordChecks.map((check) => (
              <li key={check.label} className={check.passed ? 'checklist__item--ok' : ''}>
                {check.passed ? '✓' : '•'} {check.label}
              </li>
            ))}
          </ul>

          <FormField
            id="confirmPassword"
            label="Confirmar contraseña"
            hint="Escribe nuevamente la misma contraseña."
            error={errors.confirmPassword}
          >
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              maxLength={LIMITS.password.max}
              value={form.confirmPassword}
              onChange={(event) => update('confirmPassword', event.target.value)}
            />
          </FormField>

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}
