import { useState } from 'react';
import { X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const fieldClasses = 'grid min-w-0 content-start gap-[6px] [&_[data-slot=input]]:w-full [&_[data-slot=select]]:w-full [&_[data-slot=textarea]]:w-full [&>label]:text-[10px] [&>label]:font-bold [&>label]:text-[#39483f] [&>label>span]:text-[9px] [&>label>span]:font-normal [&>label>span]:text-[#8a938d]';

function localDateValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function initialFormValues(income) {
  return {
    categoria_id: String(income?.categoria_id ?? income?.categoria?.id ?? ''),
    fecha: income?.fecha ?? localDateValue(),
    fuente: income?.fuente ?? '',
    monto: String(income?.monto ?? ''),
    notas: income?.notas ?? '',
  };
}

function getFirstError(errors, field) {
  const error = errors?.[field];
  if (Array.isArray(error)) return error[0] ?? '';
  return typeof error === 'string' ? error : '';
}

function FieldError({ id, children }) {
  if (!children) return null;
  return <p className="m-0 text-[10px] leading-[1.45] text-error-copy" id={id} role="alert">{children}</p>;
}

export function IncomeFormDialog({
  open,
  onOpenChange,
  income,
  categories,
  categoriesState,
  categoriesError,
  onRetryCategories,
  onSave,
}) {
  const [values, setValues] = useState(() => initialFormValues(income));
  const [validationErrors, setValidationErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(income?.id);

  function changeField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setValidationErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setSubmitError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const localErrors = {};
    if (!values.categoria_id) localErrors.categoria_id = 'Selecciona una categoría.';
    if (!values.fecha) localErrors.fecha = 'Selecciona una fecha.';
    if (!values.fuente.trim()) localErrors.fuente = 'Escribe la fuente del ingreso.';
    if (values.fuente.trim().length > 150) {
      localErrors.fuente = 'La fuente permite hasta 150 caracteres.';
    }
    if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(values.monto)) {
      localErrors.monto = 'Usa hasta 10 dígitos enteros y un máximo de 2 decimales.';
    }
    if (Object.keys(localErrors).length > 0) {
      setValidationErrors(localErrors);
      return;
    }

    setSaving(true);
    setSubmitError('');
    setValidationErrors({});

    try {
      // Conserva el monto como texto para cumplir la validación decimal de la API.
      await onSave({
        categoria_id: Number(values.categoria_id),
        fecha: values.fecha,
        fuente: values.fuente.trim(),
        monto: values.monto,
        notas: values.notas.trim() || null,
      });
    } catch (requestError) {
      const fieldErrors = requestError.validationErrors ?? {};
      if (Object.keys(fieldErrors).length > 0) {
        setValidationErrors(fieldErrors);
      } else {
        setSubmitError(requestError.message || 'No se pudo guardar el ingreso.');
      }
    } finally {
      setSaving(false);
    }
  }

  const canSave = !saving && categoriesState === 'success' && categories.length > 0;

  function requestOpenChange(nextOpen) {
    // Evita cerrar el diálogo accidentalmente mientras se guarda el movimiento.
    if (saving && !nextOpen) return;
    onOpenChange(nextOpen);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={requestOpenChange}
      aria-labelledby="income-dialog-title"
      aria-describedby="income-dialog-description"
    >
      <DialogContent>
        <DialogHeader className="flex items-start justify-between gap-5 border-b border-[#e9eae3] pb-[17px]">
          <div>
            <p className="mt-0 mb-[7px] font-mono text-[9px] tracking-[0.08em] text-[#859188]">MOVIMIENTO PERSONAL</p>
            <DialogTitle id="income-dialog-title">
              {isEditing ? 'Editar ingreso' : 'Nuevo ingreso'}
            </DialogTitle>
            <DialogDescription id="income-dialog-description">
              {isEditing
                ? 'Actualiza los datos del movimiento.'
                : 'Completa los datos para registrar una entrada de dinero.'}
            </DialogDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-[#68756c]"
            onClick={() => requestOpenChange(false)}
            disabled={saving}
            aria-label="Cerrar formulario"
          >
            <X aria-hidden="true" />
          </Button>
        </DialogHeader>

        <form className="mt-[19px]" onSubmit={handleSubmit} noValidate>
          {submitError && <p className="mb-[14px] border-l-2 border-error-copy bg-[#faeae6] px-3 py-[10px] text-[11px] leading-[1.5] text-error-copy" role="alert">{submitError}</p>}

          <div className="grid grid-cols-2 gap-x-[14px] gap-y-4 max-[560px]:gap-x-[11px] max-[560px]:gap-y-[13px] max-[400px]:grid-cols-1">
            <div className={`${fieldClasses} col-span-full`}>
              <label htmlFor="income-category">Categoría</label>
              <Select
                id="income-category"
                value={values.categoria_id}
                onChange={(event) => changeField('categoria_id', event.target.value)}
                disabled={saving || categoriesState !== 'success'}
                required
                aria-invalid={Boolean(getFirstError(validationErrors, 'categoria_id'))}
                aria-describedby="income-category-error"
              >
                <option value="">
                  {categoriesState === 'loading' ? 'Cargando categorías…' : 'Selecciona una categoría'}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>{category.nombre}</option>
                ))}
              </Select>
              {categoriesState === 'error' && (
                <div className="flex items-center justify-between gap-2 text-[10px] leading-[1.45] text-error-copy" id="income-category-error" role="alert">
                  <span>{categoriesError}</span>
                  <Button type="button" variant="link" size="sm" className="pl-[3px] text-error-copy" onClick={onRetryCategories} disabled={saving}>
                    Reintentar
                  </Button>
                </div>
              )}
              {categoriesState === 'loading' && (
                <p className="m-0 text-[10px] leading-[1.45] text-[#7e897f]" id="income-category-error" role="status">
                  Cargando categorías…
                </p>
              )}
              {categoriesState === 'success' && categories.length === 0 && (
                <p className="m-0 text-[10px] leading-[1.45] text-[#7e897f]" id="income-category-error">
                  No hay categorías de ingreso disponibles para esta cuenta.
                </p>
              )}
              {categoriesState !== 'error' && categories.length > 0 && (
                <FieldError id="income-category-error">
                  {getFirstError(validationErrors, 'categoria_id')}
                </FieldError>
              )}
            </div>

            <div className={fieldClasses}>
              <label htmlFor="income-date">Fecha</label>
              <Input
                id="income-date"
                type="date"
                value={values.fecha}
                onChange={(event) => changeField('fecha', event.target.value)}
                disabled={saving}
                required
                aria-invalid={Boolean(getFirstError(validationErrors, 'fecha'))}
                aria-describedby="income-date-error"
              />
              <FieldError id="income-date-error">{getFirstError(validationErrors, 'fecha')}</FieldError>
            </div>

            <div className={fieldClasses}>
              <label htmlFor="income-amount">Monto</label>
              <div className="relative">
                <span className="absolute top-1/2 left-[11px] z-[1] -translate-y-1/2 font-mono text-[11px] text-[#6b786d]" aria-hidden="true">Q</span>
                <Input
                  className="pl-7"
                  id="income-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={values.monto}
                  onChange={(event) => changeField('monto', event.target.value)}
                  disabled={saving}
                  required
                  aria-invalid={Boolean(getFirstError(validationErrors, 'monto'))}
                  aria-describedby="income-amount-error"
                />
              </div>
              <FieldError id="income-amount-error">{getFirstError(validationErrors, 'monto')}</FieldError>
            </div>

            <div className={`${fieldClasses} col-span-full`}>
              <label htmlFor="income-source">Fuente</label>
              <Input
                id="income-source"
                type="text"
                value={values.fuente}
                onChange={(event) => changeField('fuente', event.target.value)}
                maxLength={150}
                placeholder="Ej. Salario, venta, honorarios"
                disabled={saving}
                required
                aria-invalid={Boolean(getFirstError(validationErrors, 'fuente'))}
                aria-describedby="income-source-error"
              />
              <FieldError id="income-source-error">{getFirstError(validationErrors, 'fuente')}</FieldError>
            </div>

            <div className={`${fieldClasses} col-span-full`}>
              <label htmlFor="income-notes">Notas <span>(opcional)</span></label>
              <Textarea
                id="income-notes"
                value={values.notas}
                onChange={(event) => changeField('notas', event.target.value)}
                rows={3}
                placeholder="Agrega un detalle si lo necesitas"
                disabled={saving}
                aria-invalid={Boolean(getFirstError(validationErrors, 'notas'))}
                aria-describedby="income-notes-error"
              />
              <FieldError id="income-notes-error">{getFirstError(validationErrors, 'notas')}</FieldError>
            </div>
          </div>

          <DialogFooter className="mt-[23px] flex justify-end gap-2 border-t border-[#e9eae3] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => requestOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSave}>
              {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear ingreso'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
