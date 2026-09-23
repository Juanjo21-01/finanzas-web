import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, ChartLineUp, Wallet } from '@phosphor-icons/react';

export function AuthLayout({ mode, title, description, children }) {
  const isLogin = mode === 'login';

  return (
    <main className="auth-page">
      <aside className="auth-story" aria-label="Finanzas personales con claridad">
        <Link className="brand brand-on-dark" to={isLogin ? '/login' : '/register'}>
          <span className="brand-mark"><ChartLineUp weight="bold" /></span>
          <span>saldo<span className="brand-period">.</span></span>
        </Link>

        <div className="story-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Finanzas personales, a tu ritmo</p>
          <h2>Que tus números<br />cuenten <em>tu historia.</em></h2>
          <p className="story-description">
            Un espacio sencillo para entender tus hábitos y decidir con más calma.
          </p>
        </div>

        <div className="ledger-card" aria-hidden="true">
          <div className="ledger-heading">
            <span className="ledger-icon"><Wallet weight="duotone" /></span>
            <span className="ledger-caption">TU MES, EN PERSPECTIVA</span>
            <span className="ledger-arrow"><ArrowUpRight /></span>
          </div>
          <div className="ledger-total">Q 8,420<span>.50</span></div>
          <div className="ledger-foot">
            <span><i className="ledger-spark" /> Balance disponible</span>
            <span className="ledger-trend"><Check weight="bold" /> al día</span>
          </div>
          <div className="ledger-bars">
            {[34, 48, 40, 66, 54, 76, 62, 90, 69, 82, 58, 72].map((height, index) => (
              <span key={index} style={{ '--bar-height': `${height}%` }} />
            ))}
          </div>
          <div className="ledger-months"><span>JUN</span><span>JUL</span><span>AGO</span><span>SEP</span></div>
        </div>

        <p className="story-footnote">CLARIDAD PARA CADA DECISIÓN</p>
      </aside>

      <section className="auth-panel">
        <div className="auth-panel-top">
          <span className="mobile-brand brand">
            <span className="brand-mark"><ChartLineUp weight="bold" /></span>
            <span>saldo<span className="brand-period">.</span></span>
          </span>
          <p>
            {isLogin ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta?'}{' '}
            <Link to={isLogin ? '/register' : '/login'}>
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
              <ArrowUpRight weight="bold" />
            </Link>
          </p>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-heading">
            <p className="eyebrow auth-eyebrow">{isLogin ? 'BIENVENIDO DE VUELTA' : 'EMPIEZA POR AQUÍ'}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {children}
          <p className="auth-privacy"><span className="privacy-dot" /> Tu espacio financiero queda vinculado a esta cuenta.</p>
        </div>

        <div className="auth-panel-bottom">
          <span>© 2026 SALDO</span>
          <span>HECHO PARA VERLO CLARO</span>
        </div>
      </section>
    </main>
  );
}
