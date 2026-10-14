import { DashboardPeriodSelector } from '@/components/DashboardPeriodSelector';
import { DashboardSummary } from '@/components/DashboardSummary';

export function DashboardHeader({ name, period, onPeriodChange }) {
  return (
    <header>
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 id="dashboard-title" className="m-0 text-4xl leading-tight font-semibold tracking-tight text-tinta sm:text-5xl">Tu resumen financiero</h1>
          <p className="mt-2 mb-0 text-base text-tinta-suave">{name ? `Hola, ${name}. ` : ''}Consulta tus ingresos, egresos y balance por período.</p>
        </div>

        <DashboardPeriodSelector period={period} onPeriodChange={onPeriodChange} />
      </div>

      {/* Reinicia los datos al cambiar de período; el selector conserva el foco. */}
      <DashboardSummary key={`${period.year}-${period.month}`} period={period} />
    </header>
  );
}
