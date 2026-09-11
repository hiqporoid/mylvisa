export const HELSINKI = "Europe/Helsinki";
const DAY = 86_400_000;
const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: HELSINKI,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
export function helsinkiDate(now: Date = new Date()): string {
  const parts = formatter.formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function dayNumber(date: string): number {
  if (!isDateKey(date)) throw new Error("Invalid calendar date");
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / DAY);
}
export function addDays(date: string, days: number): string {
  return new Date((dayNumber(date) + days) * DAY).toISOString().slice(0, 10);
}
export function formatDate(date: string, long = false): string {
  return new Intl.DateTimeFormat(
    "fi-FI",
    long
      ? { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
      : { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" },
  ).format(new Date(`${date}T12:00:00Z`));
}
// Find the first instant of the next Helsinki date. Binary search handles 23/25-hour DST days.
export function nextMidnight(now: Date): Date {
  const today = helsinkiDate(now);
  let low = now.getTime();
  let high = low + 27 * 3_600_000;
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    if (helsinkiDate(new Date(mid)) === today) low = mid;
    else high = mid;
  }
  return new Date(high);
}
