import { useEffect, useId, useState } from 'react';
import {
  ArrowClockwise,
  FunnelSimple,
  PencilSimple,
  Plus,
  Receipt,
  Trash,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';
import { dashboardMonths } from '@/lib/dashboardPeriod';
import { formatCurrency } from '@/lib/movements';
import { cn } from '@/lib/utils';

const today = new Date();
// El color de cada libro anticipa su significado: azul entra, magenta sale.
const toneStyles = {
  ingreso: { text: 'text-ingreso', card: 'border-t-ingreso', button: 'default' },
  egreso: { text: 'text-egreso', card: 'border-t-egreso', button: 'egreso' },
};

const labelClasses = 'grid gap-1.5 text-xs font-semibold text-tinta-suave';

function readCollectionRows(response) {
  // La API devuelve colecciones dentro de `data`; acepta también una lista directa.
  if (Array.isArray(response?.data)) return response.data;
  return Array.isArray(response) ? response : [];
}

function sortMovements(movements) {
  return [...movements].sort((first, second) => (
    (second.fecha ?? '').localeCompare(first.fecha ?? '') || Number(second.id) - Number(first.id)
  ));
}

function sumAmounts(movements) {
  const cents = movements.reduce((total, movement) => {
    const amount = Number(movement.monto);
    return Number.isFinite(amount) ? total + Math.round(amount * 100) : total;
  }, 0);
  return cents / 100;
}

/*
 * Libro de movimientos compartido por Ingresos y Egresos. Cada página aporta
 * su `config`: endpoint, textos, columnas y formulario.
 */
export function MovementsPage({ config }) {
  const {
    tone,
    endpoint,
    categoryType,
    noun,
    plural,
    title,
    description,
    newLabel,
    emptyTitle,
    emptyText,
    emptyCta,
    columns,
    itemLabel,
    FormDialog,
    formItemProp,
  } = config;
  const styles = toneStyles[tone];
  const titleId = useId();

  const [yearInput, setYearInput] = useState(String(today.getFullYear()));
  const [monthInput, setMonthInput] = useState(String(today.getMonth() + 1));
  const [filters, setFilters] = useState({
    year: String(today.getFullYear()),
    month: String(today.getMonth() + 1),
  });
  const [movements, setMovements] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [mutationError, setMutationError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formItem, setFormItem] = useState(null);
  const [formVersion, setFormVersion] = useState(0);
  const [categories, setCategories] = useState([]);
  const [categoriesState, setCategoriesState] = useState('idle');
  const [categoriesError, setCategoriesError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadMovements() {
      // El endpoint espera `anio` y `mes`; omitir el mes muestra todo el año.
      const query = new URLSearchParams({ anio: filters.year });
      if (filters.month) query.set('mes', filters.month);

      try {
        const response = await api.get(`${endpoint}?${query.toString()}`);
        if (!active) return;
        setMovements(readCollectionRows(response));
        setLoadState('success');
      } catch (requestError) {
        if (!active) return;
        setErrorMessage(requestError.message || `No se pudieron cargar los ${plural}.`);
        setLoadState('error');
      }
    }

    loadMovements();

    // Descarta respuestas de filtros anteriores si una petición sigue en curso.
    return () => {
      active = false;
    };
  }, [endpoint, plural, filters, retryCount]);

  function applyFilters(event) {
    event.preventDefault();
    setMutationError('');
    setErrorMessage('');
    setLoadState('loading');
    setFilters({ year: yearInput, month: monthInput });
  }

  function retryLoading() {
    setErrorMessage('');
    setLoadState('loading');
    setRetryCount((current) => current + 1);
  }

  async function loadCategories() {
    setCategoriesState('loading');
    setCategoriesError('');

    try {
      const response = await api.get(`categorias?tipo=${categoryType}`);
      setCategories(readCollectionRows(response));
      setCategoriesState('success');
    } catch (requestError) {
      setCategoriesError(requestError.message || 'No se pudieron cargar las categorías.');
      setCategoriesState('error');
    }
  }

  function openForm(item = null) {
    setMutationError('');
    setFormItem(item);
    setFormVersion((current) => current + 1);
    setFormOpen(true);

    if (categoriesState === 'idle' || categoriesState === 'error') loadCategories();
  }

  async function saveMovement(values) {
    const isEditing = Boolean(formItem?.id);
    const response = isEditing
      ? await api.put(`${endpoint}/${formItem.id}`, values)
      : await api.post(endpoint, values);
    const saved = response?.data ?? response;

    setMovements((current) => {
      const withoutSaved = current.filter((movement) => movement.id !== saved.id);
      const yearMatches = String(saved.fecha ?? '').slice(0, 4) === filters.year;
      const monthMatches = !filters.month
        || String(saved.fecha ?? '').slice(5, 7) === filters.month.padStart(2, '0');
      const next = yearMatches && monthMatches ? [...withoutSaved, saved] : withoutSaved;

      return sortMovements(next);
    });

    setFormOpen(false);
    setFormItem(null);
    setMutationError('');
  }

  async function deleteMovement(movement) {
    // Solicita confirmación antes de borrar un movimiento de forma permanente.
    const confirmed = window.confirm(
      `¿Eliminar el ${noun} «${itemLabel(movement) || 'sin nombre'}»? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setDeletingId(movement.id);
    setMutationError('');

    try {
      await api.delete(`${endpoint}/${movement.id}`);
      setMovements((current) => current.filter((item) => item.id !== movement.id));
    } catch (requestError) {
      setMutationError(requestError.message || `No se pudo eliminar el ${noun}.`);
    } finally {
      setDeletingId(null);
    }
  }

  const busy = deletingId !== null;
  const rowName = (movement) => itemLabel(movement) || noun;
  const formProps = { [formItemProp]: formItem };

  return (
    <section className="mx-auto w-full max-w-[1120px] pt-10 pb-14 md:pt-14" aria-labelledby={titleId}>
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 id={titleId} className="m-0 text-4xl leading-tight font-semibold tracking-tight text-tinta sm:text-5xl">{title}</h1>
          <p className="mt-2 mb-0 text-base text-tinta-suave">{description}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <form className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-3 sm:flex" onSubmit={applyFilters}>
            <label className={labelClasses}>
              <span>Año</span>
              <Input
                className="sm:w-28"
                aria-label="Año"
                type="number"
                min="1900"
                max="2100"
                inputMode="numeric"
                value={yearInput}
                onChange={(event) => setYearInput(event.target.value)}
                required
                disabled={busy}
              />
            </label>
            <label className={labelClasses}>
              <span>Mes</span>
              <Select
                className="sm:w-40"
                aria-label="Mes"
                value={monthInput}
                onChange={(event) => setMonthInput(event.target.value)}
                disabled={busy}
              >
                <option value="">Todo el año</option>
                {dashboardMonths.map((month, index) => (
                  <option key={month} value={String(index + 1)}>{month}</option>
                ))}
              </Select>
            </label>
            <Button type="submit" variant="outline" disabled={busy}>
              <FunnelSimple aria-hidden="true" />
              Filtrar
            </Button>
          </form>
          <Button
            type="button"
            variant={styles.button}
            onClick={() => openForm()}
            disabled={loadState === 'loading' || busy}
          >
            <Plus aria-hidden="true" />
            {newLabel}
          </Button>
        </div>
      </div>

      <Card className={cn('border-t-4', styles.card)}>
        <CardHeader className="flex items-center justify-between gap-4 border-b border-renglon px-5 py-4 sm:px-6">
          <h2 className="m-0 text-lg font-semibold">Detalle del período</h2>
          {loadState === 'success' && (
            <span className="eyebrow">
              {movements.length} {movements.length === 1 ? 'registro' : 'registros'}
            </span>
          )}
        </CardHeader>

        <CardContent>
          {mutationError && (
            <p className="mx-4 mt-4 mb-0 rounded-md border-l-4 border-egreso bg-egreso-suave px-3 py-2.5 text-sm leading-normal text-egreso" role="alert">{mutationError}</p>
          )}

          {loadState === 'loading' && (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-6 py-8 text-center text-tinta-suave" role="status" aria-live="polite">
              <span className="size-6 animate-spin rounded-full border-2 border-renglon border-t-tinta motion-reduce:animate-none" aria-hidden="true" />
              <p className="m-0 max-w-md text-sm">Cargando {plural}…</p>
            </div>
          )}

          {loadState === 'error' && (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 px-6 py-8 text-center" role="alert">
              <p className="m-0 max-w-md text-base font-semibold text-egreso">No pudimos cargar tus {plural}</p>
              <p className="m-0 max-w-md text-sm text-tinta-suave">{errorMessage}</p>
              <Button type="button" variant="outline" className="mt-2" onClick={retryLoading}>
                <ArrowClockwise aria-hidden="true" />
                Reintentar
              </Button>
            </div>
          )}

          {loadState === 'success' && movements.length === 0 && (
            <div className="flex min-h-[270px] flex-col items-center justify-center gap-2 px-6 py-8 text-center">
              <span className="mb-1 grid size-12 place-items-center rounded-full bg-papel text-2xl text-tinta-suave">
                <Receipt weight="light" aria-hidden="true" />
              </span>
              <p className="m-0 max-w-md text-base font-semibold">{emptyTitle}</p>
              <p className="m-0 max-w-md text-sm text-tinta-suave">{emptyText}</p>
              <Button type="button" variant={styles.button} className="mt-2" onClick={() => openForm()}>
                <Plus aria-hidden="true" />
                {emptyCta}
              </Button>
            </div>
          )}

          {loadState === 'success' && movements.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(({ key, label }) => <TableHead key={key}>{label}</TableHead>)}
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="w-28 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => {
                  const isDeleting = deletingId === movement.id;

                  return (
                    <TableRow key={movement.id}>
                      {columns.map(({ key, className, render }) => (
                        <TableCell key={key} className={className}>{render(movement)}</TableCell>
                      ))}
                      <TableCell className={cn('cifra text-right font-semibold whitespace-nowrap', styles.text)}>
                        {formatCurrency(movement.monto)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => openForm(movement)}
                            disabled={busy}
                            aria-label={`Editar ${rowName(movement)}`}
                            title={`Editar ${noun}`}
                          >
                            <PencilSimple aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            onClick={() => deleteMovement(movement)}
                            disabled={busy}
                            aria-label={`Eliminar ${rowName(movement)}`}
                            title={isDeleting ? 'Eliminando…' : `Eliminar ${noun}`}
                          >
                            {isDeleting
                              ? <ArrowClockwise className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                              : <Trash aria-hidden="true" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              {/* Cierre del libro: total del período con doble subrayado. */}
              <TableFooter>
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="h-16 font-semibold">Total del período</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <span className="cifra doble-subrayado rounded-md bg-marcador px-2 py-1 text-base font-bold text-tinta">
                      {formatCurrency(sumAmounts(movements))}
                    </span>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>

      <FormDialog
        key={formVersion}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setFormItem(null);
        }}
        {...formProps}
        categories={categories}
        categoriesState={categoriesState}
        categoriesError={categoriesError}
        onRetryCategories={loadCategories}
        onSave={saveMovement}
      />
    </section>
  );
}
