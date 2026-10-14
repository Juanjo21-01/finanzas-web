import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyOpen } from '@phosphor-icons/react';
import { AuthLayout } from '@/components/AuthLayout';
import { PasswordField } from '@/components/PasswordField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      await login({ email: email.trim(), password });
      const destination = location.state?.from;
      navigate(destination ? `${destination.pathname}${destination.search ?? ''}${destination.hash ?? ''}` : '/', {
        replace: true,
      });
    } catch (requestError) {
      setError(requestError.message || 'No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.');
    }
  }

  return (
    <AuthLayout
      mode="login"
      title="Inicia sesión"
      description="Entra a tu espacio y sigue el hilo de tus finanzas."
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-1.5">
          <label className="text-sm font-semibold" htmlFor="login-email">Correo electrónico</label>
          <Input
            id="login-email"
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
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold" htmlFor="login-password">Contraseña</label>
            <span className="inline-flex items-center gap-1 text-xs text-tinta-suave"><LockKeyOpen aria-hidden="true" /> Acceso protegido</span>
          </div>
          <PasswordField
            id="login-password"
            name="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && <p className="m-0 rounded-md border-l-4 border-egreso bg-egreso-suave px-3 py-2.5 text-sm leading-normal text-egreso" role="alert">{error}</p>}

        <Button type="submit" size="lg" className="w-full justify-between" disabled={loading}>
          <span>{loading ? 'Ingresando…' : 'Entrar a mi cuenta'}</span>
          {!loading && <ArrowRight weight="bold" aria-hidden="true" />}
        </Button>

        <p className="m-0 text-center text-sm text-tinta-suave">¿Primera vez por aquí? <Link className="font-semibold text-ingreso underline underline-offset-4" to="/register">Crea tu cuenta</Link></p>
      </form>
    </AuthLayout>
  );
}
