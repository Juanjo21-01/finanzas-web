import { useEffect, useState } from 'react';
import {
  ArrowClockwise,
  ArrowDownRight,
  ArrowUpRight,
  CalendarBlank,
  Scales,
} from '@phosphor-icons/react';
import { DashboardMetricCard } from '@/components/DashboardMetricCard';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { dashboardMonths } from '@/lib/dashboardPeriod';

const metrics = [
  { field: 'ingresos_mes', title: 'Ingresos del mes', icon: ArrowUpRight },
  { field: 'egresos_mes', title: 'Egresos del mes', icon: ArrowDownRight },
  { field: 'balance_mes', title: 'Balance del mes', icon: Scales, balance: true },
  { field: 'balance_acumulado', title: 'Acumulado del año', icon: CalendarBlank },
];

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

        const validSummary = metrics.every(({ field }) => (
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

  const selectedMonth = dashboardMonths[Number(month) - 1];
  const periodLabel = `${selectedMonth} ${year}`;
  const accumulatedPeriod = Number(month) === 1
    ? `Enero ${year}`
    : `Enero a ${selectedMonth.toLowerCase()} ${year}`;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[12px]">
        <h2 className="m-0 font-semibold text-[#526558]">{periodLabel}</h2>
        <span className="font-mono text-[10px] text-muted-copy">Montos en quetzales · GTQ</span>
      </div>

      {loadState === 'error' && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-error-copy/25 bg-[#fffefa] p-4" role="alert">
          <div>
            <p className="m-0 text-[13px] font-semibold text-error-copy">No pudimos obtener tu resumen</p>
            <p className="mt-1 mb-0 text-[12px] text-muted-copy">{errorMessage}</p>
          </div>
          <Button type="button" variant="outline" className="border-line px-3 text-forest" onClick={retryLoading}>
            <ArrowClockwise aria-hidden="true" />
            Reintentar
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 min-[1280px]:grid-cols-4" aria-label={`Métricas de ${periodLabel}`} aria-busy={loadState === 'loading'} aria-live="polite">
        {metrics.map(({ field, ...metric }) => (
          <DashboardMetricCard
            key={field}
            {...metric}
            amount={loadState === 'success' ? summary[field] : null}
            description={field === 'balance_acumulado' ? accumulatedPeriod : periodLabel}
            loading={loadState === 'loading'}
          />
        ))}
      </div>
    </div>
  );
}
