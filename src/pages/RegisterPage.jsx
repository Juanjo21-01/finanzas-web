import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeSlash } from '@phosphor-icons/react';
import { AuthLayout } from '@/components/AuthLayout';
import { useAuth } from '@/context/AuthContext';

export function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <form className="auth-form auth-form-register" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="register-name">Nombre</label>
        <input
          className="auth-input"
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

        <label className="field-label" htmlFor="register-email">Correo electrónico</label>
        <input
          className="auth-input"
          id="register-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nombre@correo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label className="field-label" htmlFor="register-password">Contraseña</label>
        <div className="password-field">
          <input
            className="auth-input"
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="new-password"
            placeholder="Al menos 8 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
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

        <label className="field-label" htmlFor="register-confirm-password">Confirma tu contraseña</label>
        <input
          className="auth-input"
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

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="auth-submit" type="submit" disabled={loading}>
          <span>{loading ? 'Creando cuenta…' : 'Crear mi cuenta'}</span>
          {!loading && <ArrowRight weight="bold" />}
        </button>

        <p className="form-switch">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </form>
    </AuthLayout>
  );
}
