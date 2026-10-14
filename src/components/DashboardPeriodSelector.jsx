import { Select } from '@/components/ui/select';
import { dashboardMonths, dashboardYears } from '@/lib/dashboardPeriod';

const labelClasses = 'grid gap-1.5 text-xs font-semibold text-tinta-suave';

export function DashboardPeriodSelector({ period, onPeriodChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
      <label className={labelClasses}>
        <span>Año</span>
        <Select
          className="sm:w-28"
          value={period.year}
          onChange={(event) => onPeriodChange({ ...period, year: event.target.value })}
        >
          {dashboardYears.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Select>
      </label>
      <label className={labelClasses}>
        <span>Mes</span>
        <Select
          className="sm:w-40"
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
