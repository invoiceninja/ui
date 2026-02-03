import { DateRangeEntry } from '$app/components/DataTable';

export const normalizeColumnName = (columnName: string): string => {
  if (!columnName) return '';
  return columnName.trimEnd();
};

export function buildDateRangeQueryParameter(
  entries: DateRangeEntry[]
): string {
  return entries
    .filter((entry) => entry.startDate.length > 0 && entry.endDate.length > 0)
    .map((entry) => `${entry.column},${entry.startDate},${entry.endDate}`)
    .join('|');
}
