import { ExpenseFormDialog } from '@/components/ExpenseFormDialog';
import { MovementsPage } from '@/components/MovementsPage';
import { formatDate } from '@/lib/movements';

const config = {
  tone: 'egreso',
  endpoint: 'egresos',
  categoryType: 'egreso',
  noun: 'egreso',
  plural: 'egresos',
  title: 'Tus egresos',
  description: 'Revisa y organiza las salidas de dinero de tu cuenta.',
  newLabel: 'Nuevo egreso',
  emptyTitle: 'Todavía no hay egresos',
  emptyText: 'No hay movimientos en este período. Registra tu primer egreso para empezar a llevar el control de tus gastos.',
  emptyCta: 'Registrar primer egreso',
  columns: [
    { key: 'fecha', label: 'Fecha', render: (expense) => formatDate(expense.fecha) },
    { key: 'descripcion', label: 'Descripción', className: 'min-w-[180px] font-semibold', render: (expense) => expense.descripcion },
    { key: 'categoria', label: 'Categoría', render: (expense) => expense.categoria?.nombre ?? '—' },
    { key: 'subcategoria', label: 'Subcategoría', render: (expense) => expense.subcategoria?.nombre ?? '—' },
  ],
  itemLabel: (expense) => expense.descripcion,
  FormDialog: ExpenseFormDialog,
  formItemProp: 'expense',
};

export function EgresosPage() {
  return <MovementsPage config={config} />;
}
