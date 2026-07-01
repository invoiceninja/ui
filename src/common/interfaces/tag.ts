/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const TAG_ENTITY_TYPES = {
  global: 'global',
  bankTransaction: 'bank_transaction',
  client: 'client',
  credit: 'credit',
  expense: 'expense',
  invoice: 'invoice',
  payment: 'payment',
  product: 'product',
  project: 'project',
  invoice: 'invoice',
  quote: 'quote',
  credit: 'credit',
  expense: 'expense',
  recurring_invoice: 'recurring_invoice',
  recurring_expense: 'recurring_expense',
  client: 'client',
  vendor: 'vendor',
  payment: 'payment',
  purchase_order: 'purchase_order',
  product: 'product',
  bank_transaction: 'bank_transaction',
} as const;

export type TagEntityType =
  (typeof TAG_ENTITY_TYPES)[keyof typeof TAG_ENTITY_TYPES];

export const TAG_ENTITY_TYPE_OPTIONS = [
  { labelKey: TAG_ENTITY_TYPES.global, value: TAG_ENTITY_TYPES.global },
  {
    labelKey: TAG_ENTITY_TYPES.bankTransaction,
    value: TAG_ENTITY_TYPES.bankTransaction,
  },
  { labelKey: TAG_ENTITY_TYPES.client, value: TAG_ENTITY_TYPES.client },
  { labelKey: TAG_ENTITY_TYPES.credit, value: TAG_ENTITY_TYPES.credit },
  { labelKey: TAG_ENTITY_TYPES.expense, value: TAG_ENTITY_TYPES.expense },
  { labelKey: TAG_ENTITY_TYPES.invoice, value: TAG_ENTITY_TYPES.invoice },
  { labelKey: TAG_ENTITY_TYPES.payment, value: TAG_ENTITY_TYPES.payment },
  { labelKey: TAG_ENTITY_TYPES.product, value: TAG_ENTITY_TYPES.product },
  { labelKey: TAG_ENTITY_TYPES.project, value: TAG_ENTITY_TYPES.project },
  {
    labelKey: TAG_ENTITY_TYPES.purchaseOrder,
    value: TAG_ENTITY_TYPES.purchaseOrder,
  },
  { labelKey: TAG_ENTITY_TYPES.quote, value: TAG_ENTITY_TYPES.quote },
  {
    labelKey: TAG_ENTITY_TYPES.recurringExpense,
    value: TAG_ENTITY_TYPES.recurringExpense,
  },
  {
    labelKey: TAG_ENTITY_TYPES.recurringInvoice,
    value: TAG_ENTITY_TYPES.recurringInvoice,
  },
  { labelKey: TAG_ENTITY_TYPES.task, value: TAG_ENTITY_TYPES.task },
  {
    labelKey: TAG_ENTITY_TYPES.transaction,
    value: TAG_ENTITY_TYPES.transaction,
  },
  { labelKey: TAG_ENTITY_TYPES.vendor, value: TAG_ENTITY_TYPES.vendor },
] as const;

export const TAG_ENTITY_TYPE_VALUES = TAG_ENTITY_TYPE_OPTIONS.map(
  ({ value }) => value
);

export function resolveTagEntityType(
  entityType: string | null | undefined
): TagEntityType {
  const entityTypeClassName = entityType?.split('\\').pop() || '';
  const normalizedEntityType = entityTypeClassName
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toLowerCase()
    .replace(/^_+|_+$/g, '');

  const matchingEntityType = TAG_ENTITY_TYPE_VALUES.find(
    (value) => value === normalizedEntityType
  );

  if (matchingEntityType) {
    return matchingEntityType;
  }

  if (normalizedEntityType.includes(TAG_ENTITY_TYPES.bankTransaction)) {
    return TAG_ENTITY_TYPES.bankTransaction;
  }

  return TAG_ENTITY_TYPES.global;
}

export interface Tag {
  id: string;
  entity_type: string;
  name: string;
  color: string | null;
  is_deleted: boolean;
  archived_at: number;
  created_at: number;
  updated_at: number;
}
