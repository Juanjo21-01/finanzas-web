import { Link } from 'react-router-dom';
import { ArrowRight, ChartLineUp } from '@phosphor-icons/react';
import { useAuth } from '@/context/AuthContext';

export function HomePage() {
  const { user, logout, loading } = useAuth();

  return (
    <main className="home-page">
      <header className="home-header">
        <Link className="brand" to="/" aria-label="Saldo, inicio">
          <span className="brand-mark"><ChartLineUp weight="bold" /></span>
          <span>saldo<span className="brand-period">.</span></span>
        </Link>
        <div className="home-account">
          <span className="account-avatar" aria-hidden="true">{user?.name?.charAt(0)?.toUpperCase()}</span>
          <span className="account-email">{user?.email}</span>
          <button className="logout-button" onClick={logout} disabled={loading}>
            {loading ? 'Saliendo…' : 'Cerrar sesión'}
            <ArrowRight />
          </button>
        </div>
      </header>
      <section className="home-welcome">
        <p className="eyebrow auth-eyebrow">TU ESPACIO FINANCIERO</p>
        <h1>Hola, {user?.name?.split(' ')[0]}.</h1>
        <p>Tu sesión está activa. Aquí podrás consultar y organizar tus finanzas.</p>
        <div className="home-session"><span className="eyebrow-dot" /> Sesión segura y activa</div>
      </section>
    </main>
  );
}
