import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { AuthLayout } from '@/components/AuthLayout';
import { PasswordField } from '@/components/PasswordField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

export function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'No se pudo crear la cuenta. Revisa tus datos e inténtalo de nuevo.');
    }
  }

  return (
    <AuthLayout
      mode="register"
      title="Crea tu cuenta"
      description="Un buen mapa de tus finanzas empieza con tus datos."
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-1.5">
          <label className="text-sm font-semibold" htmlFor="register-name">Nombre</label>
          <Input
            id="register-name"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="¿Cómo te llamas?"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={255}
            required
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-semibold" htmlFor="register-email">Correo electrónico</label>
          <Input
            id="register-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="nombre@correo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-semibold" htmlFor="register-password">Contraseña</label>
          <PasswordField
            id="register-password"
            name="password"
            autoComplete="new-password"
            placeholder="Al menos 8 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-semibold" htmlFor="register-confirm-password">Confirma tu contraseña</label>
          <Input
            id="register-confirm-password"
            type="password"
            name="password_confirmation"
            autoComplete="new-password"
            placeholder="Escríbela otra vez"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            minLength={8}
            required
          />
        </div>

        {error && <p className="m-0 rounded-md border-l-4 border-egreso bg-egreso-suave px-3 py-2.5 text-sm leading-normal text-egreso" role="alert">{error}</p>}

        <Button type="submit" size="lg" className="mt-1 w-full justify-between" disabled={loading}>
          <span>{loading ? 'Creando cuenta…' : 'Crear mi cuenta'}</span>
          {!loading && <ArrowRight weight="bold" aria-hidden="true" />}
        </Button>

        <p className="m-0 text-center text-sm text-tinta-suave">¿Ya tienes cuenta? <Link className="font-semibold text-ingreso underline underline-offset-4" to="/login">Inicia sesión</Link></p>
      </form>
    </AuthLayout>
  );
}
