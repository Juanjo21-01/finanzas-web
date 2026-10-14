import { DashboardPeriodSelector } from '@/components/DashboardPeriodSelector';
import { DashboardSummary } from '@/components/DashboardSummary';

export function DashboardHeader({ name, period, onPeriodChange }) {
  return (
    <header>
      <div className="mb-8 flex items-end justify-between gap-[30px] max-[1100px]:flex-col max-[1100px]:items-stretch max-[760px]:mb-[22px] max-[760px]:gap-[22px]">
        <div>
          <p className="m-0 font-mono text-[10px] leading-[1.6] font-semibold tracking-[0.085em] text-[#718274] uppercase">TU ESPACIO FINANCIERO</p>
          <h1 id="dashboard-title" className="mt-[11px] mb-2 font-[Georgia,Times_New_Roman,serif] text-[clamp(37px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.055em] text-ink">Tu resumen financiero</h1>
          <p className="m-0 text-[13px] leading-[1.6] text-muted-copy">{name ? `Hola, ${name}. ` : ''}Consulta tus ingresos, egresos y balance por período.</p>
        </div>

        <DashboardPeriodSelector period={period} onPeriodChange={onPeriodChange} />
      </div>

      {/* Reinicia los datos al cambiar de período; el selector conserva el foco. */}
      <DashboardSummary key={`${period.year}-${period.month}`} period={period} />
    </header>
  );
}
