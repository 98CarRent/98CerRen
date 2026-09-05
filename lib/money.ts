export function formatBaht(n: number): string {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export function calcDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const diff = Math.round((e.getTime() - s.getTime()) / 86400000);
  return diff > 0 ? diff : 1;
}

export function calcPrice(pricePerDay: number, start: string, end: string): number {
  return pricePerDay * calcDays(start, end);
}