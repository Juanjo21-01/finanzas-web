import { useAuth } from '@/context/AuthContext';

export function HomePage() {
  const { user } = useAuth();

  return (
    <section className="home-welcome">
      <p className="eyebrow auth-eyebrow">TU ESPACIO FINANCIERO</p>
      <h1>Hola, {user?.name?.split(' ')[0]}.</h1>
      <p>Tu sesión está activa. Aquí podrás consultar y organizar tus finanzas.</p>
      <div className="home-session"><span className="eyebrow-dot" /> Sesión segura y activa</div>
    </section>
  );
}
