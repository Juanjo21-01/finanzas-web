import { useEffect, useState } from 'react';
import {
  ArrowClockwise,
  FunnelSimple,
  Plus,
  PencilSimple,
  Receipt,
  Trash,
} from '@phosphor-icons/react';
import { ExpenseFormDialog } from '@/components/ExpenseFormDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';

const today = new Date();
const monthOptions = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const guatemalaCurrency = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(amount) {
  const numericAmount = Number(amount);
  return Number.isFinite(numericAmount) ? guatemalaCurrency.format(numericAmount) : '—';
}

function formatDate(dateValue) {
  if (!dateValue) return '—';

  // Interpreta la fecha sin hora como local para evitar cambios de día por zona horaria.
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function readCollectionRows(response) {
  // Laravel entrega los registros de una colección dentro de la propiedad `data`.
  if (Array.isArray(response?.data)) return response.data;
  return Array.isArray(response) ? response : [];
}

export function EgresosPage() {
  const [yearInput, setYearInput] = useState(String(today.getFullYear()));
  const [monthInput, setMonthInput] = useState(String(today.getMonth() + 1));
  const [filters, setFilters] = useState({
    year: String(today.getFullYear()),
    month: String(today.getMonth() + 1),
  });
  const [expenses, setExpenses] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [mutationError, setMutationError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formExpense, setFormExpense] = useState(null);
  const [formVersion, setFormVersion] = useState(0);
  const [categories, setCategories] = useState([]);
  const [categoriesState, setCategoriesState] = useState('idle');
  const [categoriesError, setCategoriesError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadExpenses() {
      // La API acepta `anio` y `mes`; sin mes, devuelve todos los egresos del año.
      const query = new URLSearchParams({ anio: filters.year });
      if (filters.month) query.set('mes', filters.month);

      try {
        const response = await api.get(`egresos?${query.toString()}`);
        if (!active) return;
        setExpenses(readCollectionRows(response));
        setLoadState('success');
      } catch (requestError) {
        if (!active) return;
        setErrorMessage(requestError.message || 'No se pudieron cargar los egresos.');
        setLoadState('error');
      }
    }

    loadExpenses();

    // Ignora respuestas antiguas si se aplica otro filtro antes de que terminen.
    return () => {
      active = false;
    };
  }, [filters, retryCount]);

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
      const response = await api.get('categorias?tipo=egreso');
      setCategories(readCollectionRows(response));
      setCategoriesState('success');
    } catch (requestError) {
      setCategoriesError(requestError.message || 'No se pudieron cargar las categorías.');
      setCategoriesState('error');
    }
  }

  function openExpenseForm(expense = null) {
    setMutationError('');
    setFormExpense(expense);
    setFormVersion((current) => current + 1);
    setFormOpen(true);

    if (categoriesState === 'idle' || categoriesState === 'error') loadCategories();
  }

  async function saveExpense(values) {
    const isEditing = Boolean(formExpense?.id);
    const response = isEditing
      ? await api.put(`egresos/${formExpense.id}`, values)
      : await api.post('egresos', values);
    const savedExpense = response?.data ?? response;

    setExpenses((current) => {
      const withoutSavedExpense = current.filter((expense) => expense.id !== savedExpense.id);
      const yearMatches = String(savedExpense.fecha ?? '').slice(0, 4) === filters.year;
      const monthMatches = !filters.month
        || String(savedExpense.fecha ?? '').slice(5, 7) === filters.month.padStart(2, '0');
      const next = yearMatches && monthMatches
        ? [...withoutSavedExpense, savedExpense]
        : withoutSavedExpense;

      return next.sort((first, second) => (
        (second.fecha ?? '').localeCompare(first.fecha ?? '') || Number(second.id) - Number(first.id)
      ));
    });

    setFormOpen(false);
    setFormExpense(null);
    setMutationError('');
  }

  async function deleteExpense(expense) {
    // Confirma antes de enviar la solicitud DELETE, que no se puede deshacer.
    const confirmed = window.confirm(
      `¿Eliminar el egreso «${expense.descripcion}»? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setDeletingId(expense.id);
    setMutationError('');

    try {
      await api.delete(`egresos/${expense.id}`);
      setExpenses((current) => current.filter((item) => item.id !== expense.id));
    } catch (requestError) {
      setMutationError(requestError.message || 'No se pudo eliminar el egreso.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1120px] pt-[70px] pb-[56px] max-[760px]:pt-[42px] max-[560px]:pt-[34px]" aria-labelledby="expenses-title">
      <div className="mb-8 flex items-end justify-between gap-[30px] max-[760px]:mb-[22px] max-[760px]:flex-col max-[760px]:items-stretch max-[760px]:gap-[22px]">
        <div>
          <p className="m-0 font-mono text-[10px] leading-[1.6] font-semibold tracking-[0.085em] text-[#718274] uppercase">CONTROL DE EGRESOS</p>
          <h1 id="expenses-title" className="mt-[11px] mb-2 font-[Georgia,Times_New_Roman,serif] text-[clamp(37px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.055em] text-ink">Tus egresos</h1>
          <p className="m-0 text-[13px] leading-[1.6] text-muted-copy">Revisa y organiza las salidas de dinero de tu cuenta.</p>
        </div>

        <div className="flex items-end gap-2 max-[760px]:self-start max-[760px]:flex-wrap max-[560px]:w-full max-[560px]:flex-col max-[560px]:items-stretch">
          <form className="flex items-end gap-[9px] max-[560px]:grid max-[560px]:w-full max-[560px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]" onSubmit={applyFilters}>
            <label className="grid gap-[6px] text-[10px] font-bold text-[#657168]">
              <span>Año</span>
              <Input
                className="w-[130px] max-[560px]:w-full"
                aria-label="Año"
                type="number"
                min="1900"
                max="2100"
                inputMode="numeric"
                value={yearInput}
                onChange={(event) => setYearInput(event.target.value)}
                required
                disabled={deletingId !== null}
              />
            </label>
            <label className="grid gap-[6px] text-[10px] font-bold text-[#657168]">
              <span>Mes</span>
              <Select
                className="w-[150px] max-[560px]:w-full"
                aria-label="Mes"
                value={monthInput}
                onChange={(event) => setMonthInput(event.target.value)}
                disabled={deletingId !== null}
              >
                <option value="">Todo el año</option>
                {monthOptions.map((month, index) => (
                  <option key={month} value={String(index + 1)}>{month}</option>
                ))}
              </Select>
            </label>
            <Button type="submit" className="h-[38px] self-end bg-leaf text-[#17352d] hover:bg-[#b9dc67]" disabled={deletingId !== null}>
              <FunnelSimple aria-hidden="true" />
              Filtrar
            </Button>
          </form>
          <Button
            type="button"
            className="h-[38px] bg-forest text-[#f7f8f1] hover:bg-forest-light max-[560px]:w-full"
            onClick={() => openExpenseForm()}
            disabled={loadState === 'loading' || deletingId !== null}
          >
            <Plus aria-hidden="true" />
            Nuevo egreso
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between gap-4 border-b border-[#e9eae3] px-[23px] py-5 max-[560px]:px-[15px] max-[560px]:py-[17px]">
          <div>
            <p className="mt-0 mb-[5px] font-mono text-[9px] tracking-[0.08em] text-[#859188]">MOVIMIENTOS REGISTRADOS</p>
            <h2 className="m-0 text-[15px] font-semibold tracking-[-0.02em] text-[#25372e]">Detalle del período</h2>
          </div>
          {loadState === 'success' && (
            <span className="font-mono text-[10px] text-[#718075]">
              {expenses.length} {expenses.length === 1 ? 'registro' : 'registros'}
            </span>
          )}
        </CardHeader>

        <CardContent>
          {mutationError && <p className="mt-[14px] mx-4 mb-0 border-l-2 border-error-copy bg-[#faeae6] px-3 py-[10px] text-[11px] leading-[1.5] text-error-copy" role="alert">{mutationError}</p>}

          {loadState === 'loading' && (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-[9px] px-7 py-7 text-center text-[#748077] max-[560px]:px-[18px]" role="status" aria-live="polite">
              <span className="size-[23px] animate-spin rounded-full border-2 border-[#dce5d3] border-t-[#61833e] motion-reduce:animate-none" aria-hidden="true" />
              <p className="m-0 max-w-[420px] text-[12px] leading-[1.6]">Cargando egresos…</p>
            </div>
          )}

          {loadState === 'error' && (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-[9px] px-7 py-7 text-center text-[#748077] [&>button]:mt-2 max-[560px]:px-[18px]" role="alert">
              <p className="m-0 max-w-[420px] text-[15px] leading-[1.6] font-semibold text-error-copy">No pudimos cargar tus egresos</p>
              <p className="m-0 max-w-[420px] text-[12px] leading-[1.6]">{errorMessage}</p>
              <Button
                type="button"
                variant="outline"
                onClick={retryLoading}
              >
                <ArrowClockwise aria-hidden="true" />
                Reintentar
              </Button>
            </div>
          )}

          {loadState === 'success' && expenses.length === 0 && (
            <div className="flex min-h-[270px] flex-col items-center justify-center gap-[9px] px-7 py-7 text-center text-[#748077] max-[560px]:px-[18px]">
              <span className="mb-[3px] grid size-[47px] place-items-center rounded-full bg-[#edf2e5] text-[22px] text-[#52725d]"><Receipt weight="light" aria-hidden="true" /></span>
              <p className="m-0 max-w-[420px] text-[15px] leading-[1.6] font-semibold text-[#2e4036]">Todavía no hay egresos</p>
              <p className="m-0 max-w-[420px] text-[12px] leading-[1.6]">No hay movimientos en este período. Registra tu primer egreso de este período para empezar a llevar el control de tus gastos.</p>
            </div>
          )}

          {loadState === 'success' && expenses.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Subcategoría</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="w-[124px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => {
                    const isDeleting = deletingId === expense.id;

                    return (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.fecha)}</TableCell>
                        <TableCell className="min-w-[180px] font-semibold text-[#26382e]">{expense.descripcion}</TableCell>
                        <TableCell>{expense.categoria?.nombre ?? '—'}</TableCell>
                        <TableCell>{expense.subcategoria?.nombre ?? '—'}</TableCell>
                        <TableCell className="text-right font-mono text-[11px] font-semibold whitespace-nowrap text-[#244a39]">{formatCurrency(expense.monto)}</TableCell>
                        <TableCell className="w-[124px] text-right">
                          <div className="flex items-center justify-end gap-[5px]">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              className="text-[#375748]"
                              onClick={() => openExpenseForm(expense)}
                              disabled={deletingId !== null}
                              aria-label={`Editar ${expense.descripcion}`}
                              title="Editar egreso"
                            >
                              <PencilSimple aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon-sm"
                              onClick={() => deleteExpense(expense)}
                              disabled={deletingId !== null}
                              aria-label={`Eliminar ${expense.descripcion}`}
                              title={isDeleting ? 'Eliminando…' : 'Eliminar egreso'}
                            >
                              {isDeleting ? <ArrowClockwise className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Trash aria-hidden="true" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <ExpenseFormDialog
        key={formVersion}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setFormExpense(null);
        }}
        expense={formExpense}
        categories={categories}
        categoriesState={categoriesState}
        categoriesError={categoriesError}
        onRetryCategories={loadCategories}
        onSave={saveExpense}
      />
    </section>
  );
}
