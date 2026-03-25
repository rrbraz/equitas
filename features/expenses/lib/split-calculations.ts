export function sanitizeCurrencyInput(value: string) {
  const raw = value.replace(/[^\d.,]/g, "");

  if (!raw) {
    return "";
  }

  const lastCommaIndex = raw.lastIndexOf(",");
  const lastDotIndex = raw.lastIndexOf(".");
  const decimalSeparatorIndex = Math.max(lastCommaIndex, lastDotIndex);

  if (decimalSeparatorIndex === -1) {
    return raw.replace(/[^\d]/g, "");
  }

  const integerPart = raw.slice(0, decimalSeparatorIndex).replace(/[^\d]/g, "");
  const decimalDigits = raw
    .slice(decimalSeparatorIndex + 1)
    .replace(/[^\d]/g, "");

  if (decimalDigits.length === 0 || decimalDigits.length > 2) {
    return raw.replace(/[^\d]/g, "");
  }

  const normalizedIntegerPart = integerPart || "0";
  const decimalPart = decimalDigits.slice(0, 2);

  return `${normalizedIntegerPart}.${decimalPart}`;
}

export function parseCurrencyInput(value: string) {
  return Number(sanitizeCurrencyInput(value) || 0);
}

export function formatInputAmount(value: number) {
  return (Math.round(value * 100) / 100).toFixed(2);
}

export function getDistributedAmounts(totalAmount: number, count: number) {
  if (count <= 0) {
    return [];
  }

  const totalInCents = Math.round(totalAmount * 100);
  const baseShare = Math.floor(totalInCents / count);
  const remainder = totalInCents % count;

  return Array.from({ length: count }, (_, index) => {
    const shareInCents = baseShare + (index < remainder ? 1 : 0);

    return shareInCents / 100;
  });
}
