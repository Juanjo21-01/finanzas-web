import { Select } from '@/components/ui/select';
import { dashboardMonths, dashboardYears } from '@/lib/dashboardPeriod';

export function DashboardPeriodSelector({ period, onPeriodChange }) {
  return (
    <div className="flex items-end gap-[9px] max-[1100px]:self-start max-[560px]:grid max-[560px]:w-full max-[560px]:grid-cols-2">
      <label className="grid gap-[6px] text-[10px] font-bold text-[#657168]">
        <span>Año</span>
        <Select
          className="w-[100px] max-[560px]:w-full"
          value={period.year}
          onChange={(event) => onPeriodChange({ ...period, year: event.target.value })}
        >
          {dashboardYears.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Select>
      </label>
      <label className="grid gap-[6px] text-[10px] font-bold text-[#657168]">
        <span>Mes</span>
        <Select
          className="w-[150px] max-[560px]:w-full"
          value={period.month}
          onChange={(event) => onPeriodChange({ ...period, month: event.target.value })}
        >
          {dashboardMonths.map((month, index) => (
            <option key={month} value={String(index + 1)}>{month}</option>
          ))}
        </Select>
      </label>
    </div>
  );
}
