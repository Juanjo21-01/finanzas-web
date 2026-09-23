import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeSlash, LockKeyOpen } from '@phosphor-icons/react';
import { AuthLayout } from '@/components/AuthLayout';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="login-email">Correo electrónico</label>
        <input
          className="auth-input"
          id="login-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nombre@correo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <div className="field-row">
          <label className="field-label" htmlFor="login-password">Contraseña</label>
          <span className="field-hint"><LockKeyOpen /> Acceso protegido</span>
        </div>
        <div className="password-field">
          <input
            className="auth-input"
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            className="password-toggle"
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeSlash /> : <Eye />}
          </button>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="auth-submit" type="submit" disabled={loading}>
          <span>{loading ? 'Ingresando…' : 'Entrar a mi cuenta'}</span>
          {!loading && <ArrowRight weight="bold" />}
        </button>

        <p className="form-switch">¿Primera vez por aquí? <Link to="/register">Crea tu cuenta</Link></p>
      </form>
    </AuthLayout>
  );
}
