import { useEffect, useState } from 'react';
import { ArrowClockwise } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { dashboardMonths } from '@/lib/dashboardPeriod';
import { cn } from '@/lib/utils';

const requiredFields = ['ingresos_mes', 'egresos_mes', 'balance_mes', 'balance_acumulado'];

const currencyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const COUNT_UP_MS = 700;

function parseAmount(amount) {
  const value = Number(amount);
  return Number.isFinite(value) ? value : null;
}

function formatAmount(value) {
  return value === null ? '—' : currencyFormatter.format(value);
}

// Cuenta desde cero hasta el valor al cargar; con movimiento reducido salta directo.
function useCountUp(target) {
  const [shown, setShown] = useState(0);
  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (target === null || reduceMotion) return undefined;

    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / COUNT_UP_MS, 1);
      setShown(target * (1 - (1 - progress) ** 3));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, reduceMotion]);

  if (target === null) return null;
  return reduceMotion ? target : shown;
}

function Column({ label, tone, amount, description, loading }) {
  return (
    <div className="min-w-0 p-5 sm:p-6">
      <h3 className={cn('eyebrow m-0', tone)}>{label}</h3>
      {loading ? (
        <div className="mt-3 space-y-3">
          <Skeleton className="h-9 w-3/4 max-w-[220px]" />
          <Skeleton className="h-4 w-1/2 max-w-[150px]" />
        </div>
      ) : (
        <>
          <p className={cn('cifra mt-3 mb-0 text-3xl font-semibold break-words sm:text-4xl', tone)}>{formatAmount(amount)}</p>
          <p className="mt-2 mb-0 text-sm text-tinta-suave">{description}</p>
        </>
      )}
    </div>
  );
}

export function DashboardSummary({ period }) {
  const { year, month } = period;
  const [summary, setSummary] = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      const query = new URLSearchParams({ anio: year, mes: month });

      try {
        const response = await api.get(`dashboard/resumen?${query.toString()}`);
        if (!active) return;

        const validSummary = requiredFields.every((field) => (
          response?.[field] !== null
          && response?.[field] !== undefined
          && String(response[field]).trim() !== ''
          && Number.isFinite(Number(response[field]))
        ));
        if (!validSummary) throw new Error('El servidor devolvió un resumen incompleto.');

        setSummary(response);
        setLoadState('success');
      } catch (requestError) {
        if (!active) return;
        setErrorMessage(requestError.message || 'No se pudo consultar el resumen financiero.');
        setLoadState('error');
      }
    }

    loadSummary();

    // Una respuesta anterior no debe sustituir el período recién seleccionado.
    return () => {
      active = false;
    };
  }, [year, month, retryCount]);

  function retryLoading() {
    setErrorMessage('');
    setLoadState('loading');
    setRetryCount((current) => current + 1);
  }

  const loading = loadState === 'loading';
  const selectedMonth = dashboardMonths[Number(month) - 1];
  const periodLabel = `${selectedMonth} ${year}`;
  const accumulatedPeriod = Number(month) === 1
    ? `Enero ${year}`
    : `Enero a ${selectedMonth.toLowerCase()} ${year}`;

  const income = loadState === 'success' ? parseAmount(summary.ingresos_mes) : null;
  const expenses = loadState === 'success' ? parseAmount(summary.egresos_mes) : null;
  const balance = loadState === 'success' ? parseAmount(summary.balance_mes) : null;
  const accumulated = loadState === 'success' ? parseAmount(summary.balance_acumulado) : null;
  const animatedBalance = useCountUp(balance);

  return (
    <div>
      {loadState === 'error' && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-egreso/30 bg-egreso-suave p-4" role="alert">
          <div>
            <p className="m-0 text-sm font-semibold text-egreso">No pudimos obtener tu resumen</p>
            <p className="mt-1 mb-0 text-sm text-tinta-suave">{errorMessage}</p>
          </div>
          <Button type="button" variant="outline" onClick={retryLoading}>
            <ArrowClockwise aria-hidden="true" />
            Reintentar
          </Button>
        </div>
      )}

      <Card aria-label={`Libro de ${periodLabel}`} aria-busy={loading}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-renglon px-5 py-3 sm:px-6">
          <h2 className="m-0 text-lg font-semibold">{periodLabel}</h2>
          <span className="eyebrow">Montos en quetzales · GTQ</span>
        </div>

        <div className="grid divide-y divide-renglon sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <Column label="Ingresos" tone="text-ingreso" amount={income} description="Entradas del mes" loading={loading} />
          <Column label="Egresos" tone="text-egreso" amount={expenses} description="Salidas del mes" loading={loading} />
        </div>

        {/* Cierre del libro: el saldo va resaltado y con doble subrayado. */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t-2 border-tinta bg-papel/60 px-5 py-5 sm:px-6" aria-live="polite">
          <h3 className="m-0 text-lg font-semibold">Balance del mes</h3>
          {loading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <>
              <span className="sr-only">{formatAmount(balance)}</span>
              <p className="m-0" aria-hidden="true">
                <span className="cifra doble-subrayado rounded-md bg-marcador px-2.5 py-1 text-3xl font-bold text-tinta sm:text-4xl">
                  {formatAmount(animatedBalance)}
                </span>
              </p>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-renglon px-5 py-3 text-sm sm:px-6">
          <span className="text-tinta-suave">Acumulado del año · {accumulatedPeriod}</span>
          {loading ? (
            <Skeleton className="h-5 w-28" />
          ) : (
            <span className="cifra font-semibold">{formatAmount(accumulated)}</span>
          )}
        </div>
      </Card>
    </div>
  );
}
