import {
  ArrowDownRight,
  ArrowUpRight,
  ChartLineUp,
  House,
  SignOut,
} from '@phosphor-icons/react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const navigation = [
  { to: '/', label: 'Resumen', end: true, Icon: House },
  { to: '/ingresos', label: 'Ingresos', Icon: ArrowUpRight },
  { to: '/egresos', label: 'Egresos', Icon: ArrowDownRight },
];

export function AuthenticatedLayout() {
  const { user, logout, loading } = useAuth();
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="grid min-h-screen min-h-svh grid-cols-[256px_minmax(0,1fr)] bg-paper text-ink max-[760px]:flex max-[760px]:flex-col">
      <aside className="sticky top-0 flex h-screen min-h-svh flex-col bg-forest px-[18px] pt-[31px] pb-5 text-[#eef2e9] max-[760px]:z-20 max-[760px]:grid max-[760px]:h-auto max-[760px]:min-h-0 max-[760px]:grid-cols-[minmax(0,1fr)_auto] max-[760px]:grid-rows-[auto_auto] max-[760px]:gap-x-[10px] max-[760px]:gap-y-[13px] max-[760px]:px-5 max-[760px]:pt-[15px] max-[760px]:pb-[11px] max-[560px]:px-[13px]">
        <Link
          className="mx-[10px] inline-flex w-fit items-center gap-[10px] self-start text-[21px] font-bold tracking-[-1.3px] text-[#f6f7ec] no-underline max-[760px]:col-start-1 max-[760px]:row-start-1 max-[760px]:my-auto max-[560px]:ml-[7px]"
          to="/"
          aria-label="Saldo, inicio"
        >
          <span className="grid size-8 place-items-center rounded-[10px_10px_10px_2px] bg-leaf text-[19px] text-forest">
            <ChartLineUp weight="bold" />
          </span>
          <span>saldo<span className="text-[#94bb46]">.</span></span>
        </Link>

        <p className="mt-[54px] mb-[13px] mx-[11px] font-mono text-[9px] tracking-[0.11em] text-[#91a79b] max-[760px]:hidden">
          TU ESPACIO FINANCIERO
        </p>

        <nav
          className="grid gap-[5px] max-[760px]:col-span-2 max-[760px]:grid-cols-3"
          aria-label="Navegación principal"
        >
          {navigation.map(({ to, label, end, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (
                `relative flex min-h-[46px] items-center gap-3 rounded-[3px] px-3 text-xs no-underline transition-colors duration-150 max-[760px]:min-h-[42px] max-[760px]:justify-center max-[760px]:gap-[7px] max-[760px]:px-[7px] max-[560px]:gap-[5px] max-[560px]:text-[10px] ${isActive
                  ? 'bg-white/10 font-bold text-[#f5f8ef]'
                  : 'text-[#bdcbc1] hover:bg-white/[0.06] hover:text-white'
                }`
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`text-[19px] max-[560px]:text-[17px] ${isActive ? 'text-[#c2e18b]' : 'text-[#91aa9a]'}`}
                    weight="regular"
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                  {isActive && (
                    <span
                      className="absolute top-[10px] bottom-[10px] left-0 w-[3px] rounded-r-sm bg-[#b6d976] max-[760px]:top-auto max-[760px]:right-3 max-[760px]:bottom-0 max-[760px]:left-3 max-[760px]:h-0.5 max-[760px]:w-auto max-[760px]:rounded-t-sm"
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto grid gap-[14px] border-t border-white/15 pt-[17px] max-[760px]:col-start-2 max-[760px]:row-start-1 max-[760px]:my-auto max-[760px]:flex max-[760px]:items-center max-[760px]:gap-[9px] max-[760px]:border-0 max-[760px]:p-0">
          <div className="flex min-w-0 items-center gap-[10px] px-0.5 max-[760px]:gap-2">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[#c2d998] text-xs font-bold text-[#233b31] max-[760px]:size-[31px]">
              {initial}
            </span>
            <span className="grid min-w-0 gap-[3px]">
              <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold text-[#f1f4eb] max-[760px]:max-w-[120px] max-[760px]:text-[10px] max-[560px]:max-w-[92px]">
                {user?.name ?? 'Usuario'}
              </strong>
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-[#9db0a4] max-[760px]:hidden">
                {user?.email}
              </span>
            </span>
          </div>
          <button
            className="flex min-h-[39px] items-center gap-[10px] rounded-[3px] border border-white/15 bg-transparent px-[10px] text-left text-[11px] text-[#bdcbc1] hover:border-white/30 hover:bg-white/[0.07] hover:text-white disabled:cursor-wait disabled:opacity-70 max-[760px]:size-[35px] max-[760px]:min-h-[35px] max-[760px]:justify-center max-[760px]:p-0"
            type="button"
            onClick={logout}
            disabled={loading}
            aria-label={loading ? 'Cerrando sesión' : 'Cerrar sesión'}
          >
            <SignOut className="text-[17px] text-[#c2d998]" aria-hidden="true" />
            <span className="max-[760px]:sr-only">{loading ? 'Saliendo…' : 'Cerrar sesión'}</span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-[clamp(24px,5vw,76px)] max-[760px]:px-[22px] max-[760px]:pb-8 max-[560px]:px-4">
        <Outlet />
      </main>
    </div>
  );
}
