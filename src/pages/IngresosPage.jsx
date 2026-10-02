import { useEffect, useState } from 'react';
import {
  ArrowClockwise,
  FunnelSimple,
  PencilSimple,
  Plus,
  Receipt,
  Trash,
} from '@phosphor-icons/react';
import { IncomeFormDialog } from '@/components/IncomeFormDialog';
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

  // Parsea la fecha como local para que no cambie de día por la zona horaria.
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function readCollectionRows(response) {
  // La API devuelve colecciones dentro de `data`; acepta también una lista directa.
  if (Array.isArray(response?.data)) return response.data;
  return Array.isArray(response) ? response : [];
}

function sortIncomes(incomes) {
  return [...incomes].sort((first, second) => (
    (second.fecha ?? '').localeCompare(first.fecha ?? '') || Number(second.id) - Number(first.id)
  ));
}

export function IngresosPage() {
  const [yearInput, setYearInput] = useState(String(today.getFullYear()));
  const [monthInput, setMonthInput] = useState(String(today.getMonth() + 1));
  const [filters, setFilters] = useState({
    year: String(today.getFullYear()),
    month: String(today.getMonth() + 1),
  });
  const [incomes, setIncomes] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [mutationError, setMutationError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formIncome, setFormIncome] = useState(null);
  const [formVersion, setFormVersion] = useState(0);
  const [categories, setCategories] = useState([]);
  const [categoriesState, setCategoriesState] = useState('idle');
  const [categoriesError, setCategoriesError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadIncomes() {
      // El endpoint espera `anio` y `mes`; omitir el mes muestra todo el año.
      const query = new URLSearchParams({ anio: filters.year });
      if (filters.month) query.set('mes', filters.month);

      try {
        const response = await api.get(`ingresos?${query.toString()}`);
        if (!active) return;
        setIncomes(readCollectionRows(response));
        setLoadState('success');
      } catch (requestError) {
        if (!active) return;
        setErrorMessage(requestError.message || 'No se pudieron cargar los ingresos.');
        setLoadState('error');
      }
    }

    loadIncomes();

    // Descarta respuestas de filtros anteriores si una petición sigue en curso.
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
      const response = await api.get('categorias?tipo=ingreso');
      setCategories(readCollectionRows(response));
      setCategoriesState('success');
    } catch (requestError) {
      setCategoriesError(requestError.message || 'No se pudieron cargar las categorías.');
      setCategoriesState('error');
    }
  }

  function openIncomeForm(income = null) {
    setMutationError('');
    setFormIncome(income);
    setFormVersion((current) => current + 1);
    setFormOpen(true);

    if (categoriesState === 'idle' || categoriesState === 'error') loadCategories();
  }

  async function saveIncome(values) {
    const isEditing = Boolean(formIncome?.id);
    const response = isEditing
      ? await api.put(`ingresos/${formIncome.id}`, values)
      : await api.post('ingresos', values);
    const savedIncome = response?.data ?? response;

    setIncomes((current) => {
      const withoutSavedIncome = current.filter((income) => income.id !== savedIncome.id);
      const yearMatches = String(savedIncome.fecha ?? '').slice(0, 4) === filters.year;
      const monthMatches = !filters.month
        || String(savedIncome.fecha ?? '').slice(5, 7) === filters.month.padStart(2, '0');
      const next = yearMatches && monthMatches
        ? [...withoutSavedIncome, savedIncome]
        : withoutSavedIncome;

      return sortIncomes(next);
    });

    setFormOpen(false);
    setFormIncome(null);
    setMutationError('');
  }

  async function deleteIncome(income) {
    // Solicita confirmación antes de borrar un movimiento de forma permanente.
    const confirmed = window.confirm(
      `¿Eliminar el ingreso «${income.fuente || income.categoria?.nombre || 'sin nombre'}»? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setDeletingId(income.id);
    setMutationError('');

    try {
      await api.delete(`ingresos/${income.id}`);
      setIncomes((current) => current.filter((item) => item.id !== income.id));
    } catch (requestError) {
      setMutationError(requestError.message || 'No se pudo eliminar el ingreso.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1120px] pt-[70px] pb-[56px] max-[760px]:pt-[42px] max-[560px]:pt-[34px]" aria-labelledby="income-title">
      <div className="mb-8 flex items-end justify-between gap-[30px] max-[760px]:mb-[22px] max-[760px]:flex-col max-[760px]:items-stretch max-[760px]:gap-[22px]">
        <div>
          <p className="m-0 font-mono text-[10px] leading-[1.6] font-semibold tracking-[0.085em] text-[#718274] uppercase">CONTROL DE INGRESOS</p>
          <h1 id="income-title" className="mt-[11px] mb-2 font-[Georgia,Times_New_Roman,serif] text-[clamp(37px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.055em] text-ink">Tus ingresos</h1>
          <p className="m-0 text-[13px] leading-[1.6] text-muted-copy">Revisa y organiza las entradas de dinero de tu cuenta.</p>
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
            onClick={() => openIncomeForm()}
            disabled={deletingId !== null}
          >
            <Plus aria-hidden="true" />
            Nuevo ingreso
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
              {incomes.length} {incomes.length === 1 ? 'registro' : 'registros'}
            </span>
          )}
        </CardHeader>

        <CardContent>
          {mutationError && <p className="mt-[14px] mx-4 mb-0 border-l-2 border-error-copy bg-[#faeae6] px-3 py-[10px] text-[11px] leading-[1.5] text-error-copy" role="alert">{mutationError}</p>}

          {loadState === 'loading' && (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-[9px] px-7 py-7 text-center text-[#748077] max-[560px]:px-[18px]" role="status" aria-live="polite">
              <span className="size-[23px] animate-spin rounded-full border-2 border-[#dce5d3] border-t-[#61833e] motion-reduce:animate-none" aria-hidden="true" />
              <p className="m-0 max-w-[420px] text-[12px] leading-[1.6]">Cargando ingresos…</p>
            </div>
          )}

          {loadState === 'error' && (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-[9px] px-7 py-7 text-center text-[#748077] [&>button]:mt-2 max-[560px]:px-[18px]" role="alert">
              <p className="m-0 max-w-[420px] text-[15px] leading-[1.6] font-semibold text-error-copy">No pudimos cargar tus ingresos</p>
              <p className="m-0 max-w-[420px] text-[12px] leading-[1.6]">{errorMessage}</p>
              <Button type="button" variant="outline" onClick={retryLoading}>
                <ArrowClockwise aria-hidden="true" />
                Reintentar
              </Button>
            </div>
          )}

          {loadState === 'success' && incomes.length === 0 && (
            <div className="flex min-h-[270px] flex-col items-center justify-center gap-[9px] px-7 py-7 text-center text-[#748077] max-[560px]:px-[18px]">
              <span className="mb-[3px] grid size-[47px] place-items-center rounded-full bg-[#edf2e5] text-[22px] text-[#52725d]"><Receipt weight="light" aria-hidden="true" /></span>
              <p className="m-0 max-w-[420px] text-[15px] leading-[1.6] font-semibold text-[#2e4036]">Todavía no hay ingresos</p>
              <p className="m-0 max-w-[420px] text-[12px] leading-[1.6]">No hay movimientos en este período. Crea tu primer ingreso para empezar a llevar el control de tus entradas.</p>
              <Button type="button" className="mt-2 bg-forest text-[#f7f8f1] hover:bg-forest-light" onClick={() => openIncomeForm()}>
                <Plus aria-hidden="true" />
                Crear primer ingreso
              </Button>
            </div>
          )}

          {loadState === 'success' && incomes.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="w-[124px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.map((income) => {
                  const isDeleting = deletingId === income.id;

                  return (
                    <TableRow key={income.id}>
                      <TableCell>{formatDate(income.fecha)}</TableCell>
                      <TableCell className="min-w-[180px] font-semibold text-[#26382e]">{income.fuente || '—'}</TableCell>
                      <TableCell>{income.categoria?.nombre ?? '—'}</TableCell>
                      <TableCell className="text-right font-mono text-[11px] font-semibold whitespace-nowrap text-[#244a39]">{formatCurrency(income.monto)}</TableCell>
                      <TableCell className="w-[124px] text-right">
                        <div className="flex items-center justify-end gap-[5px]">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className="text-[#375748]"
                            onClick={() => openIncomeForm(income)}
                            disabled={deletingId !== null}
                            aria-label={`Editar ${income.fuente || income.categoria?.nombre || 'ingreso'}`}
                            title="Editar ingreso"
                          >
                            <PencilSimple aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            onClick={() => deleteIncome(income)}
                            disabled={deletingId !== null}
                            aria-label={`Eliminar ${income.fuente || income.categoria?.nombre || 'ingreso'}`}
                            title={isDeleting ? 'Eliminando…' : 'Eliminar ingreso'}
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
          )}
        </CardContent>
      </Card>

      <IncomeFormDialog
        key={formVersion}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setFormIncome(null);
        }}
        income={formIncome}
        categories={categories}
        categoriesState={categoriesState}
        categoriesError={categoriesError}
        onRetryCategories={loadCategories}
        onSave={saveIncome}
      />
    </section>
  );
}
