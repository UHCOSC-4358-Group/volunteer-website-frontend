export function parseLocalDate(d: any): Date | null {
  if (!d) return null;
  if (d instanceof Date) return d;
  const s = String(d);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, day] = s.split("-").map((n) => Number(n));
    return new Date(y, m - 1, day);
  }
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt;
}

export function formatLocalDate(
  d: any,
  options?: Intl.DateTimeFormatOptions
): string {
  const dt = parseLocalDate(d);
  if (!dt) return "—";
  if (options) return dt.toLocaleDateString(undefined, options);
  return dt.toLocaleDateString();
}
