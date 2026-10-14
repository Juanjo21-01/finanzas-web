import {
  ArrowDownLeft,
  ArrowUpRight,
  House,
  SignOut,
} from '@phosphor-icons/react';
import { NavLink, Outlet } from 'react-router-dom';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

// El color del icono anticipa el significado: azul entra, magenta sale.
const navigation = [
  { to: '/', label: 'Resumen', end: true, Icon: House, iconClass: 'text-tinta' },
  { to: '/ingresos', label: 'Ingresos', Icon: ArrowDownLeft, iconClass: 'text-ingreso' },
  { to: '/egresos', label: 'Egresos', Icon: ArrowUpRight, iconClass: 'text-egreso' },
];

function NavItem({ to, label, end, Icon, iconClass, stacked = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn(
        'flex items-center rounded-md font-semibold no-underline transition-colors duration-150',
        stacked ? 'flex-col justify-center gap-1 py-2 text-xs' : 'h-10 gap-2 px-3.5 text-sm',
        isActive ? 'bg-marcador text-tinta' : 'text-tinta-suave hover:bg-muted hover:text-tinta',
      )}
    >
      <Icon className={cn(stacked ? 'size-6' : 'size-[18px]', iconClass)} weight="bold" aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  );
}

export function AuthenticatedLayout() {
  const { user, logout, loading } = useAuth();
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="min-h-svh bg-papel text-tinta">
      <header className="sticky top-0 z-20 border-b border-renglon bg-papel/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center gap-6 px-4 sm:px-6 lg:px-10">
          <Brand aria-label="Saldo, inicio" />

          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Navegación principal">
            {navigation.map((item) => <NavItem key={item.to} {...item} />)}
          </nav>

          <div className="ml-auto flex min-w-0 items-center gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ingreso-suave text-sm font-bold text-ingreso" aria-hidden="true">
                {initial}
              </span>
              <span className="hidden min-w-0 leading-tight lg:grid">
                <strong className="truncate text-sm font-semibold">{user?.name ?? 'Usuario'}</strong>
                <span className="truncate text-xs text-tinta-suave">{user?.email}</span>
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={logout}
              disabled={loading}
              aria-label={loading ? 'Cerrando sesión' : 'Cerrar sesión'}
            >
              <SignOut aria-hidden="true" />
              <span className="max-sm:sr-only">{loading ? 'Saliendo…' : 'Cerrar sesión'}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="min-w-0 px-4 pb-28 sm:px-6 md:pb-12 lg:px-10">
        <Outlet />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 gap-1 border-t border-renglon bg-hoja px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] md:hidden"
        aria-label="Navegación principal"
      >
        {navigation.map((item) => <NavItem key={item.to} stacked {...item} />)}
      </nav>
    </div>
  );
}
