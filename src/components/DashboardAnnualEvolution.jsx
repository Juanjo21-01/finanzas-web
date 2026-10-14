import { useEffect, useId, useState } from 'react';
import { ArrowClockwise } from '@phosphor-icons/react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { prepareAnnualData } from '@/lib/dashboardAnnual';
import { formatGTQ } from '@/lib/dashboardExpenses';
import { dashboardMonths } from '@/lib/dashboardPeriod';

const chartConfig = {
  ingresos: { label: 'Ingresos', color: 'var(--chart-2)' },
  egresos: { label: 'Egresos', color: 'var(--chart-1)' },
  balance: { label: 'Balance', color: 'var(--chart-3)' },
};

const compactFormatter = new Intl.NumberFormat('es-GT', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

// Los meses con balance negativo se marcan con un rombo rojo hueco (no solo con color).
function BalanceDot({ cx, cy, payload }) {
  if (cx == null || cy == null) return null;

  if (payload.balance < 0) {
    return (
      <rect
        x={cx - 5}
        y={cy - 5}
        width={10}
        height={10}
        transform={`rotate(45 ${cx} ${cy})`}
        fill="var(--background)"
        stroke="var(--color-egreso)"
        strokeWidth={2.5}
      />
    );
  }

  return <circle cx={cx} cy={cy} r={3.5} fill="var(--color-balance)" />;
}

export function DashboardAnnualEvolution({ year }) {
  const titleId = useId();
  const [months, setMonths] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadAnnual() {
      const query = new URLSearchParams({ anio: year });

      try {
        const response = await api.get(`dashboard/resumen-anual?${query.toString()}`);
        if (!active) return;

        setMonths(prepareAnnualData(response));
        setLoadState('success');
      } catch (requestError) {
        if (!active) return;
        setErrorMessage(requestError.message || 'No se pudo consultar la evolución anual.');
        setLoadState('error');
      }
    }

    loadAnnual();

    return () => {
      active = false;
    };
  }, [year, retryCount]);

  function retryLoading() {
    setErrorMessage('');
    setLoadState('loading');
    setRetryCount((current) => current + 1);
  }

  const negativeMonths = months.filter(({ balance }) => balance < 0);

  return (
    <Card className="mt-6" aria-labelledby={titleId}>
      <CardHeader className="flex flex-wrap items-center justify-between gap-2 border-b border-renglon px-5 py-4">
        <h2 id={titleId} className="m-0 text-lg font-semibold">Evolución anual</h2>
        <p className="eyebrow m-0">{year}</p>
      </CardHeader>

      <CardContent className="p-5" aria-busy={loadState === 'loading'}>
        {loadState === 'loading' && (
          <div role="status">
            <span className="sr-only">Consultando la evolución de {year}.</span>
            <Skeleton className="h-[300px] w-full" aria-hidden="true" />
          </div>
        )}

        {loadState === 'error' && (
          <div className="flex flex-wrap items-center justify-between gap-4" role="alert">
            <div>
              <p className="m-0 text-sm font-semibold text-egreso">No pudimos obtener la evolución anual</p>
              <p className="mt-1 mb-0 text-sm text-tinta-suave">{errorMessage}</p>
            </div>
            <Button type="button" variant="outline" onClick={retryLoading}>
              <ArrowClockwise aria-hidden="true" />
              Reintentar
            </Button>
          </div>
        )}

        {loadState === 'success' && (
          <>
            <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
              <LineChart accessibilityLayer data={months} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis
                  width={52}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => compactFormatter.format(value)}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <ReferenceLine y={0} stroke="var(--color-egreso)" strokeDasharray="4 4" strokeOpacity={0.6} />
                <ChartTooltip
                  content={(
                    <ChartTooltipContent
                      labelFormatter={(_label, payload) => {
                        const month = payload?.[0]?.payload?.mes;
                        return month ? `${dashboardMonths[month - 1]} ${year}` : '';
                      }}
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">{chartConfig[name]?.label ?? name}</span>
                          <span className={`cifra font-medium ${value < 0 ? 'text-egreso' : ''}`}>
                            {formatGTQ(value)}
                          </span>
                        </div>
                      )}
                    />
                  )}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="ingresos"
                  type="monotone"
                  stroke="var(--color-ingresos)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  dataKey="egresos"
                  type="monotone"
                  stroke="var(--color-egresos)"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  dataKey="balance"
                  type="monotone"
                  stroke="var(--color-balance)"
                  strokeWidth={2.5}
                  dot={<BalanceDot />}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartContainer>

            <p className="mt-3 mb-0 flex items-center gap-2 text-xs text-tinta-suave">
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <rect x="3.5" y="3.5" width="7" height="7" transform="rotate(45 7 7)" fill="var(--background)" stroke="var(--color-egreso)" strokeWidth="2" />
              </svg>
              Rombo rojo: mes con balance negativo
              {negativeMonths.length > 0 && ` (${negativeMonths.length})`}
            </p>

            <table className="sr-only">
              <caption>Ingresos, egresos y balance por mes de {year}</caption>
              <thead>
                <tr>
                  <th scope="col">Mes</th>
                  <th scope="col">Ingresos</th>
                  <th scope="col">Egresos</th>
                  <th scope="col">Balance</th>
                </tr>
              </thead>
              <tbody>
                {months.map(({ mes, ingresos, egresos, balance }) => (
                  <tr key={mes}>
                    <th scope="row">{dashboardMonths[mes - 1]}</th>
                    <td>{formatGTQ(ingresos)}</td>
                    <td>{formatGTQ(egresos)}</td>
                    <td>{formatGTQ(balance)}{balance < 0 ? ' (negativo)' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
