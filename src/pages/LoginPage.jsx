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
      <form className="flex flex-col gap-[9px]" onSubmit={handleSubmit}>
        <label className="mt-[9px] text-[11px] font-bold text-[#37453d]" htmlFor="login-email">Correo electrónico</label>
        <input
          className="h-12 w-full rounded-[3px] border border-line bg-[#fffefa] px-[14px] text-[13px] text-ink transition-[border-color,box-shadow,background] duration-150 motion-reduce:duration-[0.01ms] placeholder:text-[#a4aaa4] hover:border-[#b8c2b3] focus:border-[#77934a] focus:bg-white focus:shadow-[0_0_0_3px_rgb(132_169_58_/_12%)] focus:outline-none"
          id="login-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nombre@correo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <div className="mt-[9px] flex items-center justify-between">
          <label className="text-[11px] font-bold text-[#37453d]" htmlFor="login-password">Contraseña</label>
          <span className="inline-flex items-center gap-[5px] text-[10px] text-[#8a938b]"><LockKeyOpen className="text-[12px]" /> Acceso protegido</span>
        </div>
        <div className="relative">
          <input
            className="h-12 w-full rounded-[3px] border border-line bg-[#fffefa] py-0 pr-[49px] pl-[14px] text-[13px] text-ink transition-[border-color,box-shadow,background] duration-150 motion-reduce:duration-[0.01ms] placeholder:text-[#a4aaa4] hover:border-[#b8c2b3] focus:border-[#77934a] focus:bg-white focus:shadow-[0_0_0_3px_rgb(132_169_58_/_12%)] focus:outline-none"
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
            className="absolute top-0 right-[5px] grid w-10 h-12 place-items-center border-0 bg-transparent text-[17px] text-[#778078] hover:text-forest"
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeSlash /> : <Eye />}
          </button>
        </div>

        {error && <p className="mt-[4px] mb-px border-l-2 border-error-copy bg-[#faeae6] px-3 py-[10px] text-[11px] leading-[1.5] text-error-copy" role="alert">{error}</p>}

        <button className="mt-[17px] flex min-h-[50px] w-full cursor-pointer items-center justify-between rounded-[3px] border border-forest bg-forest px-4 text-[12px] font-semibold text-[#f8f8ef] transition-[background,border-color,transform] duration-150 motion-reduce:duration-[0.01ms] hover:not-disabled:-translate-y-px hover:not-disabled:border-forest-light hover:not-disabled:bg-forest-light disabled:cursor-wait disabled:opacity-70" type="submit" disabled={loading}>
          <span>{loading ? 'Ingresando…' : 'Entrar a mi cuenta'}</span>
          {!loading && <ArrowRight className="text-[17px] text-leaf" weight="bold" />}
        </button>

        <p className="mt-3 mb-0 text-center text-[11px] text-muted-copy">¿Primera vez por aquí? <Link className="font-bold text-forest underline underline-offset-[3px]" to="/register">Crea tu cuenta</Link></p>
      </form>
    </AuthLayout>
  );
}
