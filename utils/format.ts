export function formatCurrency(
  value: number | string | null | undefined,
  decimals = 2,
): string {
  const num = Number(value ?? 0);
  if (!isFinite(num) || Number.isNaN(num)) return (0).toFixed(decimals);
  return num.toFixed(decimals);
}

export function formatCurrencyWithDollar(
  value: number | string | null | undefined,
  decimals = 2,
): string {
  return `$${formatCurrency(value, decimals)}`;
}
