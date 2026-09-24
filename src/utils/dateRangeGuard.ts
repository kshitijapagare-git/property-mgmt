/**
 * Pure validator for a date range's two bounds. Both `from` and `to` are ISO date
 * strings (YYYY-MM-DD), matching the format DatePicker/DateRangePicker use elsewhere.
 * An empty `to` (not yet chosen) is not an error here — only an end date that is
 * actually before the start date is rejected. Equal dates are valid (a single-day
 * availability window is legitimate).
 */
export function validateDateRange(from: string, to: string): string | null {
  if (!from || !to) return null;
  if (to < from) return 'Available to cannot be before available from.';
  return null;
}
