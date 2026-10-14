import { useEffect, useState } from 'react';
import {
  ArrowClockwise,
  ArrowDownRight,
  ArrowUpRight,
  CalendarBlank,
  FunnelSimple,
  Scales,
} from '@phosphor-icons/react';
import { DashboardMetricCard } from '@/components/DashboardMetricCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { api } from '@/lib/api';

const today = new Date();
const monthOptions = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const metrics = [
  { field: 'ingresos_mes', title: 'Ingresos del mes', icon: ArrowUpRight },
  { field: 'egresos_mes', title: 'Egresos del mes', icon: ArrowDownRight },
  { field: 'balance_mes', title: 'Balance del mes', icon: Scales, balance: true },
  { field: 'balance_acumulado', title: 'Acumulado del año', icon: CalendarBlank },
];

export function DashboardHeader({ name }) {
  const [yearInput, setYearInput] = useState(String(today.getFullYear()));
  const [monthInput, setMonthInput] = useState(String(today.getMonth() + 1));
  const [filters, setFilters] = useState({
    year: String(today.getFullYear()),
    month: String(today.getMonth() + 1),
  });
  const [summary, setSummary] = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      const query = new URLSearchParams({ anio: filters.year, mes: filters.month });

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
  }, [filters, retryCount]);

  function applyFilters(event) {
    event.preventDefault();
    const year = String(Number(yearInput));
    setYearInput(year);
    setErrorMessage('');
    setLoadState('loading');
    setFilters({ year, month: monthInput });
  }

  function retryLoading() {
    setErrorMessage('');
    setLoadState('loading');
    setRetryCount((current) => current + 1);
  }

  const selectedMonth = monthOptions[Number(filters.month) - 1];
  const period = `${selectedMonth} ${filters.year}`;
  const accumulatedPeriod = Number(filters.month) === 1
    ? `Enero ${filters.year}`
    : `Enero a ${selectedMonth.toLowerCase()} ${filters.year}`;

  return (
    <header>
      <div className="mb-8 flex items-end justify-between gap-[30px] max-[1100px]:flex-col max-[1100px]:items-stretch max-[760px]:mb-[22px] max-[760px]:gap-[22px]">
        <div>
          <p className="m-0 font-mono text-[10px] leading-[1.6] font-semibold tracking-[0.085em] text-[#718274] uppercase">TU ESPACIO FINANCIERO</p>
          <h1 id="dashboard-title" className="mt-[11px] mb-2 font-[Georgia,Times_New_Roman,serif] text-[clamp(37px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.055em] text-ink">Tu resumen financiero</h1>
          <p className="m-0 text-[13px] leading-[1.6] text-muted-copy">{name ? `Hola, ${name}. ` : ''}Consulta tus ingresos, egresos y balance por período.</p>
        </div>

        <form className="flex items-end gap-[9px] max-[1100px]:self-start max-[560px]:grid max-[560px]:w-full max-[560px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]" onSubmit={applyFilters}>
          <label className="grid gap-[6px] text-[10px] font-bold text-[#657168]">
            <span>Año</span>
            <Input
              className="w-[100px] max-[560px]:w-full"
              type="number"
              min="1900"
              max="2100"
              inputMode="numeric"
              value={yearInput}
              onChange={(event) => setYearInput(event.target.value)}
              required
            />
          </label>
          <label className="grid gap-[6px] text-[10px] font-bold text-[#657168]">
            <span>Mes</span>
            <Select
              className="w-[150px] max-[560px]:w-full"
              value={monthInput}
              onChange={(event) => setMonthInput(event.target.value)}
            >
              {monthOptions.map((month, index) => (
                <option key={month} value={String(index + 1)}>{month}</option>
              ))}
            </Select>
          </label>
          <Button type="submit" variant="outline" className="h-[38px] border-line bg-[#fffefa] px-3 text-forest" aria-label="Aplicar filtros">
            <FunnelSimple aria-hidden="true" />
            <span className="max-[560px]:sr-only">Aplicar</span>
          </Button>
        </form>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[12px]">
        <h2 className="m-0 font-semibold text-[#526558]">{period}</h2>
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

      <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 min-[1280px]:grid-cols-4" aria-label={`Métricas de ${period}`} aria-busy={loadState === 'loading'} aria-live="polite">
        {metrics.map(({ field, ...metric }) => (
          <DashboardMetricCard
            key={field}
            {...metric}
            amount={loadState === 'success' ? summary[field] : null}
            description={field === 'balance_acumulado' ? accumulatedPeriod : period}
            loading={loadState === 'loading'}
          />
        ))}
      </div>
    </header>
  );
}
