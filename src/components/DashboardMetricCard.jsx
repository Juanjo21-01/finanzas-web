import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const currencyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function parseAmount(amount) {
  if (typeof amount === 'number') return Number.isFinite(amount) ? amount : null;
  if (typeof amount !== 'string' || !amount.trim()) return null;
  const value = Number(amount);
  return Number.isFinite(value) ? value : null;
}

export function DashboardMetricCard({
  title,
  amount,
  description,
  loading = false,
  balance = false,
  icon: Icon,
}) {
  const value = parseAmount(amount);
  const amountColor = balance && value !== null && value !== 0
    ? value > 0 ? 'text-[#397044]' : 'text-error-copy'
    : 'text-ink';

  return (
    <Card className="min-w-0 p-5" aria-label={title} aria-busy={loading}>
      <CardHeader className="mb-5 flex items-start justify-between gap-3">
        <h2 className="m-0 text-[11px] font-bold tracking-[0.04em] text-muted-copy">
          {title}
        </h2>
        {Icon && <Icon aria-hidden="true" className="size-[18px] shrink-0 text-muted-copy" />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-9 w-4/5 max-w-[190px]" />
            <Skeleton className="h-[14px] w-3/5 max-w-[155px]" />
          </div>
        ) : (
          <>
            <p className={cn('m-0 break-words font-mono text-[clamp(1.35rem,2.2vw,1.8rem)] font-semibold leading-tight tabular-nums', amountColor)}>
              {value === null ? '—' : currencyFormatter.format(value)}
            </p>
            {description && <p className="mb-0 mt-3 text-[11px] leading-[1.5] text-muted-copy">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
