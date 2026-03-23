export function formatCurrency(
  value: number,
  currency = "BRL",
  locale = "pt-BR",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatSignedCurrency(
  value: number,
  currency = "BRL",
  locale = "pt-BR",
) {
  const amount = formatCurrency(Math.abs(value), currency, locale);
  if (value === 0) {
    return amount;
  }

  return value > 0 ? `+${amount}` : `-${amount}`;
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}
