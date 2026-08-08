import { Record } from '$app/common/constants/exports/client-map';

export const columnPositions = [
  'client',
  'invoice',
  'credit',
  'quote',
  'payment',
  'vendor',
  'purchase_order',
  'task',
  'expense',
  'recurring_invoice',
  'contact',
] as const;

export function getColumnPosition(record: Record): number {
  const source = record.origin ?? record.map;

  return columnPositions.indexOf(source as (typeof columnPositions)[number]);
}
