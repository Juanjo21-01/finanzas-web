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
      <form className="flex flex-col gap-[5px] [&>label]:mt-[7px]" onSubmit={handleSubmit}>
        <label className="text-[11px] font-bold text-[#37453d]" htmlFor="register-name">Nombre</label>
        <input
          className="h-11 w-full rounded-[3px] border border-line bg-[#fffefa] px-[14px] text-[13px] text-ink transition-[border-color,box-shadow,background] duration-150 motion-reduce:duration-[0.01ms] placeholder:text-[#a4aaa4] hover:border-[#b8c2b3] focus:border-[#77934a] focus:bg-white focus:shadow-[0_0_0_3px_rgb(132_169_58_/_12%)] focus:outline-none"
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

        <label className="mt-[7px] text-[11px] font-bold text-[#37453d]" htmlFor="register-email">Correo electrónico</label>
        <input
          className="h-11 w-full rounded-[3px] border border-line bg-[#fffefa] px-[14px] text-[13px] text-ink transition-[border-color,box-shadow,background] duration-150 motion-reduce:duration-[0.01ms] placeholder:text-[#a4aaa4] hover:border-[#b8c2b3] focus:border-[#77934a] focus:bg-white focus:shadow-[0_0_0_3px_rgb(132_169_58_/_12%)] focus:outline-none"
          id="register-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nombre@correo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label className="mt-[7px] text-[11px] font-bold text-[#37453d]" htmlFor="register-password">Contraseña</label>
        <div className="relative">
          <input
            className="h-11 w-full rounded-[3px] border border-line bg-[#fffefa] py-0 pr-[49px] pl-[14px] text-[13px] text-ink transition-[border-color,box-shadow,background] duration-150 motion-reduce:duration-[0.01ms] placeholder:text-[#a4aaa4] hover:border-[#b8c2b3] focus:border-[#77934a] focus:bg-white focus:shadow-[0_0_0_3px_rgb(132_169_58_/_12%)] focus:outline-none"
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
            className="absolute top-0 right-[5px] grid w-10 h-11 place-items-center border-0 bg-transparent text-[17px] text-[#778078] hover:text-forest"
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeSlash /> : <Eye />}
          </button>
        </div>

        <label className="mt-[7px] text-[11px] font-bold text-[#37453d]" htmlFor="register-confirm-password">Confirma tu contraseña</label>
        <input
          className="h-11 w-full rounded-[3px] border border-line bg-[#fffefa] px-[14px] text-[13px] text-ink transition-[border-color,box-shadow,background] duration-150 motion-reduce:duration-[0.01ms] placeholder:text-[#a4aaa4] hover:border-[#b8c2b3] focus:border-[#77934a] focus:bg-white focus:shadow-[0_0_0_3px_rgb(132_169_58_/_12%)] focus:outline-none"
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

        {error && <p className="mt-[4px] mb-px border-l-2 border-error-copy bg-[#faeae6] px-3 py-[10px] text-[11px] leading-[1.5] text-error-copy" role="alert">{error}</p>}

        <button className="mt-3 flex min-h-[50px] w-full cursor-pointer items-center justify-between rounded-[3px] border border-forest bg-forest px-4 text-[12px] font-semibold text-[#f8f8ef] transition-[background,border-color,transform] duration-150 motion-reduce:duration-[0.01ms] hover:not-disabled:-translate-y-px hover:not-disabled:border-forest-light hover:not-disabled:bg-forest-light disabled:cursor-wait disabled:opacity-70" type="submit" disabled={loading}>
          <span>{loading ? 'Creando cuenta…' : 'Crear mi cuenta'}</span>
          {!loading && <ArrowRight className="text-[17px] text-leaf" weight="bold" />}
        </button>

        <p className="mt-3 mb-0 text-center text-[11px] text-muted-copy">¿Ya tienes cuenta? <Link className="font-bold text-forest underline underline-offset-[3px]" to="/login">Inicia sesión</Link></p>
      </form>
    </AuthLayout>
  );
}
