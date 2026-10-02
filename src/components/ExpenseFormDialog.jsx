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

const expenseFieldClasses = 'grid min-w-0 content-start gap-[6px] [&_[data-slot=input]]:w-full [&_[data-slot=select]]:w-full [&_[data-slot=textarea]]:w-full [&>label]:text-[10px] [&>label]:font-bold [&>label]:text-[#39483f] [&>label>span]:text-[9px] [&>label>span]:font-normal [&>label>span]:text-[#8a938d]';

function localDateValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function initialFormValues(expense) {
  return {
    categoria_id: String(expense?.categoria_id ?? expense?.categoria?.id ?? ''),
    subcategoria_id: String(expense?.subcategoria_id ?? expense?.subcategoria?.id ?? ''),
    fecha: expense?.fecha ?? localDateValue(),
    descripcion: expense?.descripcion ?? '',
    monto: String(expense?.monto ?? ''),
    notas: expense?.notas ?? '',
  };
}

function getFirstError(errors, field) {
  const error = errors?.[field];
  if (Array.isArray(error)) return error[0] ?? '';
  return typeof error === 'string' ? error : '';
}

function readSubcategories(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function FieldError({ id, children }) {
  if (!children) return null;
  return <p className="m-0 text-[10px] leading-[1.45] text-error-copy" id={id} role="alert">{children}</p>;
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
  categories,
  categoriesState,
  categoriesError,
  onRetryCategories,
  onSave,
}) {
  const [values, setValues] = useState(() => initialFormValues(expense));
  const [validationErrors, setValidationErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(expense?.id);
  const selectedCategory = categories.find((category) => String(category.id) === values.categoria_id);
  const subcategories = readSubcategories(selectedCategory?.subcategorias);

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

  function changeCategory(categoryId) {
    // Reset both dependent state and its backend error whenever the parent changes.
    setValues((current) => ({ ...current, categoria_id: categoryId, subcategoria_id: '' }));
    setValidationErrors((current) => {
      const next = { ...current };
      delete next.categoria_id;
      delete next.subcategoria_id;
      return next;
    });
    setSubmitError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const localErrors = {};
    if (!values.categoria_id) localErrors.categoria_id = 'Selecciona una categoría.';
    if (!values.fecha) localErrors.fecha = 'Selecciona una fecha.';
    if (!values.descripcion.trim()) localErrors.descripcion = 'Escribe una descripción.';
    if (values.descripcion.trim().length > 150) {
      localErrors.descripcion = 'La descripción permite hasta 150 caracteres.';
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
      // Keep monto as a string so it matches Laravel's decimal validation rule.
      await onSave({
        categoria_id: Number(values.categoria_id),
        subcategoria_id: values.subcategoria_id ? Number(values.subcategoria_id) : null,
        fecha: values.fecha,
        descripcion: values.descripcion.trim(),
        monto: values.monto,
        notas: values.notas.trim() || null,
      });
    } catch (requestError) {
      const fieldErrors = requestError.validationErrors ?? {};
      if (Object.keys(fieldErrors).length > 0) {
        setValidationErrors(fieldErrors);
      } else {
        setSubmitError(requestError.message || 'No se pudo guardar el egreso.');
      }
    } finally {
      setSaving(false);
    }
  }

  const canSave = !saving && categoriesState === 'success' && categories.length > 0;

  function requestOpenChange(nextOpen) {
    // Evita cerrar el diálogo accidentalmente mientras la solicitud de guardado sigue activa.
    if (saving && !nextOpen) return;
    onOpenChange(nextOpen);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={requestOpenChange}
      aria-labelledby="expense-dialog-title"
      aria-describedby="expense-dialog-description"
    >
      <DialogContent>
        <DialogHeader className="flex items-start justify-between gap-5 border-b border-[#e9eae3] pb-[17px]">
          <div>
            <p className="mt-0 mb-[7px] font-mono text-[9px] tracking-[0.08em] text-[#859188]">MOVIMIENTO PERSONAL</p>
            <DialogTitle id="expense-dialog-title">
              {isEditing ? 'Editar egreso' : 'Nuevo egreso'}
            </DialogTitle>
            <DialogDescription id="expense-dialog-description">
              {isEditing
                ? 'Actualiza los datos del movimiento.'
                : 'Completa los datos para registrar una salida de dinero.'}
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
            <div className={`${expenseFieldClasses} col-span-full`}>
              <label htmlFor="expense-category">Categoría</label>
              <Select
                id="expense-category"
                value={values.categoria_id}
                onChange={(event) => changeCategory(event.target.value)}
                disabled={saving || categoriesState !== 'success'}
                required
                aria-invalid={Boolean(getFirstError(validationErrors, 'categoria_id'))}
                aria-describedby="expense-category-error"
              >
                <option value="">
                  {categoriesState === 'loading' ? 'Cargando categorías…' : 'Selecciona una categoría'}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>{category.nombre}</option>
                ))}
              </Select>
              {categoriesState === 'error' && (
                <div className="flex items-center justify-between gap-2 text-[10px] leading-[1.45] text-error-copy" id="expense-category-error" role="alert">
                  <span>{categoriesError}</span>
                  <Button type="button" variant="link" size="sm" className="pl-[3px] text-error-copy" onClick={onRetryCategories} disabled={saving}>
                    Reintentar
                  </Button>
                </div>
              )}
              {categoriesState === 'loading' && (
                <p className="m-0 text-[10px] leading-[1.45] text-[#7e897f]" id="expense-category-error" role="status">
                  Cargando categorías…
                </p>
              )}
              {categoriesState === 'success' && categories.length === 0 && (
                <p className="m-0 text-[10px] leading-[1.45] text-[#7e897f]" id="expense-category-error">
                  No hay categorías de egreso disponibles para esta cuenta.
                </p>
              )}
              {categoriesState !== 'error' && categories.length > 0 && (
                <FieldError id="expense-category-error">
                  {getFirstError(validationErrors, 'categoria_id')}
                </FieldError>
              )}
            </div>

            <div className={`${expenseFieldClasses} col-span-full`}>
              <label htmlFor="expense-subcategory">Subcategoría <span>(opcional)</span></label>
              <Select
                id="expense-subcategory"
                value={values.subcategoria_id}
                onChange={(event) => changeField('subcategoria_id', event.target.value)}
                disabled={saving || !values.categoria_id || categoriesState !== 'success'}
                aria-invalid={Boolean(getFirstError(validationErrors, 'subcategoria_id'))}
                aria-describedby="expense-subcategory-error"
              >
                <option value="">
                  {values.categoria_id ? 'Sin subcategoría' : 'Selecciona una categoría primero'}
                </option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={String(subcategory.id)}>{subcategory.nombre}</option>
                ))}
              </Select>
              <FieldError id="expense-subcategory-error">
                {getFirstError(validationErrors, 'subcategoria_id')}
              </FieldError>
            </div>

            <div className={expenseFieldClasses}>
              <label htmlFor="expense-date">Fecha</label>
              <Input
                id="expense-date"
                type="date"
                value={values.fecha}
                onChange={(event) => changeField('fecha', event.target.value)}
                disabled={saving}
                required
                aria-invalid={Boolean(getFirstError(validationErrors, 'fecha'))}
                aria-describedby="expense-date-error"
              />
              <FieldError id="expense-date-error">{getFirstError(validationErrors, 'fecha')}</FieldError>
            </div>

            <div className={expenseFieldClasses}>
              <label htmlFor="expense-amount">Monto</label>
              <div className="relative">
                <span className="absolute top-1/2 left-[11px] z-[1] -translate-y-1/2 font-mono text-[11px] text-[#6b786d]" aria-hidden="true">Q</span>
                <Input
                  className="pl-7"
                  id="expense-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={values.monto}
                  onChange={(event) => changeField('monto', event.target.value)}
                  disabled={saving}
                  required
                  aria-invalid={Boolean(getFirstError(validationErrors, 'monto'))}
                  aria-describedby="expense-amount-error"
                />
              </div>
              <FieldError id="expense-amount-error">{getFirstError(validationErrors, 'monto')}</FieldError>
            </div>

            <div className={`${expenseFieldClasses} col-span-full`}>
              <label htmlFor="expense-description">Descripción</label>
              <Input
                id="expense-description"
                type="text"
                value={values.descripcion}
                onChange={(event) => changeField('descripcion', event.target.value)}
                maxLength={150}
                placeholder="Ej. Compra de supermercado"
                disabled={saving}
                required
                aria-invalid={Boolean(getFirstError(validationErrors, 'descripcion'))}
                aria-describedby="expense-description-error"
              />
              <FieldError id="expense-description-error">
                {getFirstError(validationErrors, 'descripcion')}
              </FieldError>
            </div>

            <div className={`${expenseFieldClasses} col-span-full`}>
              <label htmlFor="expense-notes">Notas <span>(opcional)</span></label>
              <Textarea
                id="expense-notes"
                value={values.notas}
                onChange={(event) => changeField('notas', event.target.value)}
                rows={3}
                placeholder="Agrega un detalle si lo necesitas"
                disabled={saving}
                aria-invalid={Boolean(getFirstError(validationErrors, 'notas'))}
                aria-describedby="expense-notes-error"
              />
              <FieldError id="expense-notes-error">{getFirstError(validationErrors, 'notas')}</FieldError>
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
              {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear egreso'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
