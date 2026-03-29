export const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

export const fmtMiles = (n: number) =>
  n.toLocaleString('en-US') + ' mi';

export function calcMonthly(price: number, apr = 5.9, months = 60): number {
  if (price <= 0 || months <= 0) return 0;
  if (apr <= 0) return price / months;
  const r = apr / 100 / 12;
  return (price * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}
