const quetzales = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatGTQ(amount) {
  return quetzales.format(amount);
}

export function prepareExpenseCategoryData(response) {
  if (!Array.isArray(response)) {
    throw new Error('El servidor devolvió datos de categorías incompletos.');
  }

  return response.map((category) => {
    const rawTotal = category?.total;
    const total = Number(rawTotal);
    const validTotal = (typeof rawTotal === 'number'
      || (typeof rawTotal === 'string' && rawTotal.trim() !== ''))
      && Number.isFinite(total)
      && total >= 0;

    if (!Number.isInteger(category?.categoria_id)
      || typeof category?.nombre !== 'string'
      || !category.nombre.trim()
      || !validTotal) {
      throw new Error('El servidor devolvió datos de categorías incompletos.');
    }

    return {
      categoria_id: category.categoria_id,
      nombre: category.nombre,
      total,
    };
  }).sort((first, second) => second.total - first.total);
}
