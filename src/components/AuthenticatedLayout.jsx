import {
  ArrowDownRight,
  ArrowUpRight,
  ChartLineUp,
  House,
  SignOut,
} from '@phosphor-icons/react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './AuthenticatedLayout.css';

const sections = [
  { to: '/', label: 'Resumen', end: true, Icon: House },
  { to: '/ingresos', label: 'Ingresos', Icon: ArrowUpRight },
  { to: '/egresos', label: 'Egresos', Icon: ArrowDownRight },
];

export function AuthenticatedLayout() {
  const { user, logout, loading } = useAuth();
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Navegación de Saldo">
        <Link className="brand brand-on-dark sidebar-brand" to="/" aria-label="Saldo, inicio">
          <span className="brand-mark"><ChartLineUp weight="bold" /></span>
          <span>saldo<span className="brand-period">.</span></span>
        </Link>

        <p className="sidebar-caption">Información Financiera</p>

        <nav className="sidebar-navigation" aria-label="Navegación principal">
          {sections.map(({ to, label, end, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
            >
              <Icon weight="regular" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-account">
            <span className="sidebar-avatar" aria-hidden="true">{userInitial}</span>
            <span className="sidebar-user-details">
              <strong title={user?.name ?? 'Usuario'}>{user?.name ?? 'Usuario'}</strong>
              <span title={user?.email}>{user?.email}</span>
            </span>
          </div>
          <button
            className="sidebar-logout"
            type="button"
            onClick={logout}
            disabled={loading}
            aria-label={loading ? 'Cerrando sesión' : 'Cerrar sesión'}
            title={loading ? 'Cerrando sesión' : 'Cerrar sesión'}
          >
            <SignOut weight="regular" aria-hidden="true" />
            <span>{loading ? 'Saliendo…' : 'Cerrar sesión'}</span>
          </button>
        </div>
      </aside>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
