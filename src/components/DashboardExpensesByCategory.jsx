import { useEffect, useId, useState } from 'react';
import { ArrowClockwise } from '@phosphor-icons/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { formatGTQ, prepareExpenseCategoryData } from '@/lib/dashboardExpenses';
import { dashboardMonths } from '@/lib/dashboardPeriod';

const chartConfig = {
  total: {
    label: 'Egresos',
    color: 'var(--chart-1)',
  },
};

function shortenCategoryName(name) {
  return name.length > 22 ? `${name.slice(0, 21)}…` : name;
}

export function DashboardExpensesByCategory({ period }) {
  const { year, month } = period;
  const titleId = useId();
  const [categories, setCategories] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadExpenses() {
      const query = new URLSearchParams({ anio: year, mes: month });

      try {
        const response = await api.get(`dashboard/egresos-por-categoria?${query.toString()}`);
        if (!active) return;

        setCategories(prepareExpenseCategoryData(response));
        setLoadState('success');
      } catch (requestError) {
        if (!active) return;
        setErrorMessage(requestError.message || 'No se pudieron consultar los egresos por categoría.');
        setLoadState('error');
      }
    }

    loadExpenses();

    return () => {
      active = false;
    };
  }, [year, month, retryCount]);

  function retryLoading() {
    setErrorMessage('');
    setLoadState('loading');
    setRetryCount((current) => current + 1);
  }

  const periodLabel = `${dashboardMonths[Number(month) - 1]} ${year}`;
  const chartHeight = Math.max(240, categories.length * 44 + 44);
  const amountLabelWidth = Math.max(
    96,
    ...categories.map(({ total }) => Math.ceil(formatGTQ(total).length * 7.5) + 20),
  );
  const chartMinWidth = Math.max(560, 160 + amountLabelWidth + 240);

  return (
    <Card className="mt-6 border-border bg-card text-card-foreground" aria-labelledby={titleId}>
      <CardHeader className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
        <h2 id={titleId} className="m-0 text-sm font-semibold">Egresos por categoría</h2>
        <p className="m-0 text-xs text-muted-foreground">{periodLabel}</p>
      </CardHeader>

      <CardContent className="p-5" aria-busy={loadState === 'loading'}>
        {loadState === 'loading' && (
          <div className="space-y-6 py-3" role="status">
            <span className="sr-only">Consultando egresos de {periodLabel}.</span>
            {[80, 65, 50, 35].map((width) => (
              <div key={width} className="flex items-center gap-4" aria-hidden="true">
                <Skeleton className="h-3 w-24 shrink-0 bg-muted" />
                <Skeleton className="h-6 bg-muted" style={{ width: `${width}%` }} />
                <Skeleton className="h-3 w-16 shrink-0 bg-muted" />
              </div>
            ))}
          </div>
        )}

        {loadState === 'error' && (
          <div className="flex flex-wrap items-center justify-between gap-4" role="alert">
            <div>
              <p className="m-0 text-sm font-semibold text-destructive">No pudimos obtener tus egresos</p>
              <p className="mt-1 mb-0 text-xs text-muted-foreground">{errorMessage}</p>
            </div>
            <Button type="button" variant="outline" onClick={retryLoading}>
              <ArrowClockwise aria-hidden="true" />
              Reintentar
            </Button>
          </div>
        )}

        {loadState === 'success' && categories.length === 0 && (
          <p className="m-0 py-10 text-center text-sm text-muted-foreground" role="status">
            No hay egresos en este mes.
          </p>
        )}

        {loadState === 'success' && categories.length > 0 && (
          <>
            <div
              className="overflow-x-auto pb-2"
              role="region"
              aria-label={`Gráfica de egresos de ${periodLabel}, desplazable horizontalmente`}
              tabIndex={0}
            >
              <ChartContainer
                config={chartConfig}
                className="aspect-auto w-full"
                style={{ height: chartHeight, minWidth: chartMinWidth }}
              >
                <BarChart
                  accessibilityLayer
                  data={categories}
                  layout="vertical"
                  margin={{ top: 8, right: amountLabelWidth, bottom: 8, left: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="var(--border)" />
                  <XAxis
                    type="number"
                    dataKey="total"
                    tickFormatter={formatGTQ}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={32}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="nombre"
                    tickFormatter={shortenCategoryName}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    width={160}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'var(--muted)' }}
                    content={(
                      <ChartTooltipContent
                        className="max-w-[min(22rem,90vw)]"
                        labelFormatter={(_label, payload) => (
                          <span className="block whitespace-normal break-words">
                            {payload[0]?.payload?.nombre}
                          </span>
                        )}
                        formatter={(value) => <span className="font-mono tabular-nums">{formatGTQ(value)}</span>}
                      />
                    )}
                  />
                  <Bar dataKey="total" fill="var(--color-total)" barSize={24} radius={[0, 3, 3, 0]} isAnimationActive={false}>
                    <LabelList
                      dataKey="total"
                      position="right"
                      offset={10}
                      formatter={formatGTQ}
                      fill="var(--foreground)"
                      className="font-mono text-[11px] tabular-nums"
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>

            <table className="sr-only">
              <caption>Egresos por categoría de {periodLabel}, de mayor a menor</caption>
              <thead>
                <tr><th scope="col">Categoría</th><th scope="col">Monto</th></tr>
              </thead>
              <tbody>
                {categories.map(({ categoria_id, nombre, total }) => (
                  <tr key={categoria_id}><th scope="row">{nombre}</th><td>{formatGTQ(total)}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
