import { IncomeFormDialog } from '@/components/IncomeFormDialog';
import { MovementsPage } from '@/components/MovementsPage';
import { formatDate } from '@/lib/movements';

const config = {
  tone: 'ingreso',
  endpoint: 'ingresos',
  categoryType: 'ingreso',
  noun: 'ingreso',
  plural: 'ingresos',
  title: 'Tus ingresos',
  description: 'Revisa y organiza las entradas de dinero de tu cuenta.',
  newLabel: 'Nuevo ingreso',
  emptyTitle: 'Todavía no hay ingresos',
  emptyText: 'No hay movimientos en este período. Crea tu primer ingreso para empezar a llevar el control de tus entradas.',
  emptyCta: 'Crear primer ingreso',
  columns: [
    { key: 'fecha', label: 'Fecha', render: (income) => formatDate(income.fecha) },
    { key: 'fuente', label: 'Fuente', className: 'min-w-[180px] font-semibold', render: (income) => income.fuente || '—' },
    { key: 'categoria', label: 'Categoría', render: (income) => income.categoria?.nombre ?? '—' },
  ],
  itemLabel: (income) => income.fuente || income.categoria?.nombre,
  FormDialog: IncomeFormDialog,
  formItemProp: 'income',
};

export function IngresosPage() {
  return <MovementsPage config={config} />;
}
