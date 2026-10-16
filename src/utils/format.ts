const moneyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
});

/** 1125 -> "$1.125,00" */
export function formatMoney(value: number): string {
  return moneyFormatter.format(value);
}

export function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
