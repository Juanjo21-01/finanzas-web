import { Link } from 'react-router-dom';
import { ArrowUpRight } from '@phosphor-icons/react';
import { Brand } from '@/components/Brand';

// Muestra de libro: ilustra cómo se ve un mes, con cifras de ejemplo.
function LedgerSample() {
  return (
    <div className="w-full max-w-md rounded-xl bg-hoja text-tinta shadow-[0_28px_70px_-28px_rgb(0_0_0_/_60%)]" aria-hidden="true">
      <div className="flex items-center justify-between border-b border-renglon px-6 py-3">
        <span className="text-base font-semibold">Octubre</span>
        <span className="eyebrow">Ejemplo</span>
      </div>
      <dl className="m-0 grid divide-y divide-renglon">
        <div className="flex items-baseline justify-between px-6 py-4">
          <dt className="eyebrow text-ingreso">Ingresos</dt>
          <dd className="cifra m-0 text-xl font-semibold text-ingreso">Q 12,400.00</dd>
        </div>
        <div className="flex items-baseline justify-between px-6 py-4">
          <dt className="eyebrow text-egreso">Egresos</dt>
          <dd className="cifra m-0 text-xl font-semibold text-egreso">Q 8,150.50</dd>
        </div>
      </dl>
      <div className="flex items-center justify-between rounded-b-xl border-t-2 border-tinta bg-papel/70 px-6 py-4">
        <span className="font-semibold">Balance</span>
        <span className="cifra doble-subrayado rounded-md bg-marcador px-2 py-0.5 text-xl font-bold">Q 4,249.50</span>
      </div>
    </div>
  );
}

export function AuthLayout({ mode, title, description, children }) {
  const isLogin = mode === 'login';
  const switchTo = isLogin ? '/register' : '/login';

  return (
    <main className="grid min-h-svh bg-papel lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <aside className="hidden flex-col justify-between gap-12 bg-tinta p-12 text-hoja lg:flex xl:p-16" aria-label="Finanzas personales con claridad">
        <Brand to={isLogin ? '/login' : '/register'} inverted />

        <div className="grid gap-10">
          <h2 className="m-0 max-w-md text-5xl leading-[1.05] font-semibold tracking-tight xl:text-6xl">
            Que tus números <span className="text-marcador">cuenten tu historia.</span>
          </h2>
          <LedgerSample />
          <p className="m-0 max-w-sm text-base text-hoja/75">
            Un espacio sencillo para entender tus hábitos y decidir con más calma.
          </p>
        </div>

        <p className="m-0 text-xs text-hoja/60">© 2026 Saldo</p>
      </aside>

      <section className="flex min-h-svh flex-col px-6 pt-6 pb-8 sm:px-12 lg:min-h-0">
        <div className="flex min-h-10 items-center justify-between lg:justify-end">
          <Brand className="lg:hidden" to={switchTo} aria-label="Saldo" />
          <p className="m-0 text-sm text-tinta-suave">
            {isLogin ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta?'}{' '}
            <Link className="ml-1 inline-flex items-center gap-0.5 font-semibold text-ingreso no-underline hover:underline" to={switchTo}>
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
              <ArrowUpRight className="size-3.5" weight="bold" aria-hidden="true" />
            </Link>
          </p>
        </div>

        <div className="m-auto w-full max-w-[420px] py-10">
          <div className="mb-8">
            <h1 className="m-0 text-4xl leading-tight font-semibold tracking-tight text-tinta">{title}</h1>
            <p className="mt-2 mb-0 text-base text-tinta-suave">{description}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
