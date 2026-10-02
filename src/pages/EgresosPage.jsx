import { useEffect, useState } from 'react';
import {
  ArrowClockwise,
  Check,
  FunnelSimple,
  PencilSimple,
  Receipt,
  Trash,
  X,
} from '@phosphor-icons/react';
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

function readExpenseRows(response) {
  // Laravel entrega las filas de la colección dentro de la propiedad `data`.
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
  const [editingId, setEditingId] = useState(null);
  const [editingDraft, setEditingDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadExpenses() {
      // La API acepta `anio` y `mes`; sin mes, devuelve todos los egresos del año.
      const query = new URLSearchParams({ anio: filters.year });
      if (filters.month) query.set('mes', filters.month);

      try {
        const response = await api.get(`egresos?${query.toString()}`);
        if (!active) return;
        setExpenses(readExpenseRows(response));
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
    cancelEditing();
    setFilters({ year: yearInput, month: monthInput });
  }

  function retryLoading() {
    setErrorMessage('');
    setLoadState('loading');
    setRetryCount((current) => current + 1);
  }

  function startEditing(expense) {
    setMutationError('');
    setEditingId(expense.id);
    setEditingDraft({
      fecha: expense.fecha ?? '',
      descripcion: expense.descripcion ?? '',
      monto: String(expense.monto ?? ''),
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingDraft(null);
  }

  async function saveEditing(event) {
    event.preventDefault();
    if (editingId === null || !editingDraft) return;

    if (!editingDraft.descripcion.trim()) {
      setMutationError('La descripción no puede quedar vacía.');
      return;
    }
    if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(editingDraft.monto)) {
      setMutationError('El monto debe tener hasta 10 enteros y 2 decimales.');
      return;
    }

    setSaving(true);
    setMutationError('');

    try {
      const response = await api.put(`egresos/${editingId}`, {
        fecha: editingDraft.fecha,
        descripcion: editingDraft.descripcion.trim(),
        monto: editingDraft.monto,
      });
      const updatedExpense = response?.data ?? response;
      setExpenses((current) => {
        const updated = current
          .map((expense) => (expense.id === editingId ? { ...expense, ...updatedExpense } : expense))
          .filter((expense) => {
            if (expense.id !== editingId) return true;
            const yearMatches = String(expense.fecha ?? '').slice(0, 4) === filters.year;
            const monthMatches = !filters.month
              || String(expense.fecha ?? '').slice(5, 7) === filters.month.padStart(2, '0');
            return yearMatches && monthMatches;
          });

        return updated.sort((first, second) => (
          (second.fecha ?? '').localeCompare(first.fecha ?? '') || Number(second.id) - Number(first.id)
        ));
      });
      cancelEditing();
    } catch (requestError) {
      setMutationError(requestError.message || 'No se pudo guardar el egreso.');
    } finally {
      setSaving(false);
    }
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
      if (editingId === expense.id) cancelEditing();
    } catch (requestError) {
      setMutationError(requestError.message || 'No se pudo eliminar el egreso.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="expenses-page" aria-labelledby="expenses-title">
      <div className="expenses-heading">
        <div className="expenses-title-group">
          <p className="eyebrow auth-eyebrow">CONTROL DE EGRESOS</p>
          <h1 id="expenses-title">Tus egresos</h1>
          <p>Revisa y organiza las salidas de dinero de tu cuenta.</p>
        </div>

        <form className="expenses-filters" onSubmit={applyFilters}>
          <label className="expenses-filter">
            <span>Año</span>
            <Input
              aria-label="Año"
              type="number"
              min="1900"
              max="2100"
              inputMode="numeric"
              value={yearInput}
              onChange={(event) => setYearInput(event.target.value)}
              required
              disabled={saving || deletingId !== null}
            />
          </label>
          <label className="expenses-filter">
            <span>Mes</span>
            <Select
              aria-label="Mes"
              value={monthInput}
              onChange={(event) => setMonthInput(event.target.value)}
              disabled={saving || deletingId !== null}
            >
              <option value="">Todo el año</option>
              {monthOptions.map((month, index) => (
                <option key={month} value={String(index + 1)}>{month}</option>
              ))}
            </Select>
          </label>
          <Button type="submit" className="expenses-filter-button" disabled={saving || deletingId !== null}>
            <FunnelSimple aria-hidden="true" />
            Filtrar
          </Button>
        </form>
      </div>

      <Card className="expenses-card">
        <CardHeader className="expenses-card-header">
          <div>
            <p className="expenses-card-kicker">MOVIMIENTOS REGISTRADOS</p>
            <h2>Detalle del período</h2>
          </div>
          {loadState === 'success' && (
            <span className="expenses-count">
              {expenses.length} {expenses.length === 1 ? 'registro' : 'registros'}
            </span>
          )}
        </CardHeader>

        <CardContent className="expenses-card-content">
          {mutationError && <p className="expenses-action-error" role="alert">{mutationError}</p>}

          {loadState === 'loading' && (
            <div className="expenses-state" role="status" aria-live="polite">
              <span className="expenses-spinner" aria-hidden="true" />
              <p>Cargando egresos…</p>
            </div>
          )}

          {loadState === 'error' && (
            <div className="expenses-state expenses-error-state" role="alert">
              <p className="expenses-state-title">No pudimos cargar tus egresos</p>
              <p>{errorMessage}</p>
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
            <div className="expenses-state expenses-empty-state">
              <span className="expenses-empty-icon"><Receipt weight="light" aria-hidden="true" /></span>
              <p className="expenses-state-title">Todavía no hay egresos</p>
              <p>No hay movimientos en este período. Registra tu primer egreso de este período para empezar a llevar el control de tus gastos.</p>
            </div>
          )}

          {loadState === 'success' && expenses.length > 0 && (
            <form className="expenses-table-form" id="expense-edit-form" onSubmit={saveEditing}>
              <Table className="expenses-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Subcategoría</TableHead>
                    <TableHead className="expenses-amount-heading">Monto</TableHead>
                    <TableHead className="expenses-actions-heading">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => {
                    const isEditing = editingId === expense.id;
                    const isDeleting = deletingId === expense.id;

                    return (
                      <TableRow key={expense.id}>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              aria-label={`Fecha de ${expense.descripcion}`}
                              type="date"
                              value={editingDraft.fecha}
                              onChange={(event) => setEditingDraft((current) => ({ ...current, fecha: event.target.value }))}
                              required
                              disabled={saving}
                            />
                          ) : formatDate(expense.fecha)}
                        </TableCell>
                        <TableCell className="expenses-description-cell">
                          {isEditing ? (
                            <Input
                              aria-label={`Descripción de ${expense.descripcion}`}
                              value={editingDraft.descripcion}
                              onChange={(event) => setEditingDraft((current) => ({ ...current, descripcion: event.target.value }))}
                              maxLength={150}
                              required
                              disabled={saving}
                            />
                          ) : expense.descripcion}
                        </TableCell>
                        <TableCell>{expense.categoria?.nombre ?? '—'}</TableCell>
                        <TableCell>{expense.subcategoria?.nombre ?? '—'}</TableCell>
                        <TableCell className="expenses-amount-cell">
                          {isEditing ? (
                            <Input
                              aria-label={`Monto de ${expense.descripcion}`}
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={editingDraft.monto}
                              onChange={(event) => setEditingDraft((current) => ({ ...current, monto: event.target.value }))}
                              required
                              disabled={saving}
                            />
                          ) : formatCurrency(expense.monto)}
                        </TableCell>
                        <TableCell className="expenses-actions-cell">
                          {isEditing ? (
                            <div className="expenses-row-actions">
                              <Button
                                type="submit"
                                size="sm"
                                disabled={saving}
                                aria-label="Guardar cambios"
                                title="Guardar cambios"
                              >
                                <Check aria-hidden="true" />
                                <span>{saving ? 'Guardando…' : 'Guardar'}</span>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={cancelEditing}
                                disabled={saving}
                                aria-label="Cancelar edición"
                                title="Cancelar edición"
                              >
                                <X aria-hidden="true" />
                              </Button>
                            </div>
                          ) : (
                            <div className="expenses-row-actions">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                className="expense-edit-button"
                                onClick={() => startEditing(expense)}
                                disabled={saving || deletingId !== null || editingId !== null}
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
                                disabled={saving || deletingId !== null || editingId !== null}
                                aria-label={`Eliminar ${expense.descripcion}`}
                                title={isDeleting ? 'Eliminando…' : 'Eliminar egreso'}
                              >
                                {isDeleting ? <ArrowClockwise className="expenses-delete-spinner" aria-hidden="true" /> : <Trash aria-hidden="true" />}
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
