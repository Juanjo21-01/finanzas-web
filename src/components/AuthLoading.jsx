import { BrandMark } from '@/components/Brand';

export function AuthLoading() {
  return (
    <main className="flex min-h-svh items-center justify-center gap-3 bg-papel text-sm text-tinta-suave" role="status" aria-live="polite">
      <BrandMark />
      <span>Preparando tu sesión…</span>
    </main>
  );
}
