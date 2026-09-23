export function AuthLoading() {
  return (
    <main className="auth-restoring" role="status" aria-live="polite">
      <span className="restoring-mark" aria-hidden="true">S</span>
      <span>Preparando tu sesión…</span>
    </main>
  );
}
