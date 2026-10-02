export function AuthLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center gap-[11px] bg-paper text-[12px] text-[#627067] min-h-svh" role="status" aria-live="polite">
      <span className="grid size-[30px] place-items-center rounded-[9px_9px_9px_2px] bg-leaf font-[Georgia,Times_New_Roman,serif] text-[18px] font-bold text-forest" aria-hidden="true">S</span>
      <span>Preparando tu sesión…</span>
    </main>
  );
}
