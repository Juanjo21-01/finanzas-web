export const shortMonths = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

const INCOMPLETE = 'El servidor devolvió un resumen anual incompleto.';

function toAmount(...candidates) {
  for (const raw of candidates) {
    if ((typeof raw === 'number' || (typeof raw === 'string' && raw.trim() !== ''))
      && Number.isFinite(Number(raw))) {
      return Number(raw);
    }
  }
  return null;
}

// Devuelve siempre los doce meses (ene–dic); los meses sin datos quedan en cero.
export function prepareAnnualData(response) {
  const rows = Array.isArray(response) ? response : response?.meses;
  if (!Array.isArray(rows)) throw new Error(INCOMPLETE);

  const byMonth = new Map();
  rows.forEach((row) => {
    const month = Number(row?.mes);
    if (!Number.isInteger(month) || month < 1 || month > 12) throw new Error(INCOMPLETE);

    const ingresos = toAmount(row.ingresos, row.ingresos_mes);
    const egresos = toAmount(row.egresos, row.egresos_mes);
    if (ingresos === null || egresos === null) throw new Error(INCOMPLETE);

    const balance = toAmount(row.balance, row.balance_mes) ?? ingresos - egresos;
    byMonth.set(month, { ingresos, egresos, balance });
  });

  return shortMonths.map((label, index) => ({
    mes: index + 1,
    label,
    ingresos: 0,
    egresos: 0,
    balance: 0,
    ...byMonth.get(index + 1),
  }));
}
