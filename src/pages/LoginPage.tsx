import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppError } from '../api/AppError';
import { Alert } from '../components/Alert';
import { FormField } from '../components/FormField';
import { PasswordInput } from '../components/PasswordInput';
import { useAuth } from '../context/AuthContext';
import type { LoginData } from '../models/auth';
import { LIMITS } from '../validation/limits';
import { Validator, type FieldErrors } from '../validation/Validator';

function validate(data: LoginData): FieldErrors<LoginData> {
  return {
    email: Validator.email(data.email) ?? undefined,
    password: Validator.required(data.password, 'La contraseña') ?? undefined,
  };
}

export function LoginPage() {
  const { login, notice, clearNotice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  const [data, setData] = useState<LoginData>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<LoginData>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof LoginData, value: string) => {
    setData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    clearNotice();

    const validation = validate(data);
    setErrors(validation);
    if (Validator.hasErrors(validation)) return;

    setSubmitting(true);
    try {
      await login(data);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(AppError.messageOf(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page page--narrow">
      <section className="card">
        <h1>Iniciar sesión</h1>
        <p className="muted">Ingresa con tu cuenta para buscar y gestionar tus reservas.</p>

        {notice && <Alert type="warning">{notice}</Alert>}
        {serverError && <Alert type="error">{serverError}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <FormField id="email" label="Correo electrónico" hint="El correo con el que te registraste." error={errors.email}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              maxLength={LIMITS.email.max}
              placeholder="nombre@correo.com"
              value={data.email}
              onChange={(event) => update('email', event.target.value)}
            />
          </FormField>

          <FormField id="password" label="Contraseña" error={errors.password}>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              maxLength={LIMITS.password.max}
              value={data.password}
              onChange={(event) => update('password', event.target.value)}
            />
          </FormField>

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center">
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </section>
    </main>
  );
}
