const guatemalaCurrency = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount) {
  const numericAmount = Number(amount);
  return Number.isFinite(numericAmount) ? guatemalaCurrency.format(numericAmount) : '—';
}

export function formatDate(dateValue) {
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
