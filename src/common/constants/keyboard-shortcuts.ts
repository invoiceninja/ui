/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export type ShortcutAction =
  | { type: 'navigate'; to: string }
  | { type: 'save' }
  | { type: 'search' };

export interface ShortcutDefinition {
  id: string;
  labelKey: string;
  action: ShortcutAction;
}

export type ShortcutId = string;

const navigationShortcuts: ShortcutDefinition[] = [
  {
    id: 'create_client',
    labelKey: 'new_client',
    action: { type: 'navigate', to: '/clients/create' },
  },
  {
    id: 'create_product',
    labelKey: 'new_product',
    action: { type: 'navigate', to: '/products/create' },
  },
  {
    id: 'create_invoice',
    labelKey: 'new_invoice',
    action: { type: 'navigate', to: '/invoices/create' },
  },
  {
    id: 'create_recurring_invoice',
    labelKey: 'new_recurring_invoice',
    action: { type: 'navigate', to: '/recurring_invoices/create' },
  },
  {
    id: 'create_quote',
    labelKey: 'new_quote',
    action: { type: 'navigate', to: '/quotes/create' },
  },
  {
    id: 'create_payment',
    labelKey: 'new_payment',
    action: { type: 'navigate', to: '/payments/create' },
  },
  {
    id: 'create_expense',
    labelKey: 'new_expense',
    action: { type: 'navigate', to: '/expenses/create' },
  },
  {
    id: 'create_purchase_order',
    labelKey: 'new_purchase_order',
    action: { type: 'navigate', to: '/purchase_orders/create' },
  },
  {
    id: 'create_credit',
    labelKey: 'new_credit',
    action: { type: 'navigate', to: '/credits/create' },
  },
  {
    id: 'create_project',
    labelKey: 'new_project',
    action: { type: 'navigate', to: '/projects/create' },
  },
  {
    id: 'create_task',
    labelKey: 'new_task',
    action: { type: 'navigate', to: '/tasks/create' },
  },
  {
    id: 'create_vendor',
    labelKey: 'new_vendor',
    action: { type: 'navigate', to: '/vendors/create' },
  },
  {
    id: 'create_recurring_expense',
    labelKey: 'new_recurring_expense',
    action: { type: 'navigate', to: '/recurring_expenses/create' },
  },
  {
    id: 'create_transaction',
    labelKey: 'new_transaction',
    action: { type: 'navigate', to: '/transactions/create' },
  },
  {
    id: 'create_document',
    labelKey: 'new_document',
    action: { type: 'navigate', to: '/docuninja/create' },
  },
];

const generalShortcuts: ShortcutDefinition[] = [
  {
    id: 'save',
    labelKey: 'save',
    action: { type: 'save' },
  },
  {
    id: 'search',
    labelKey: 'search',
    action: { type: 'search' },
  },
];

export const keyboardShortcuts: ShortcutDefinition[] = [
  ...navigationShortcuts,
  ...generalShortcuts,
];

export interface ShortcutGroup {
  labelKey: string;
  shortcuts: ShortcutDefinition[];
}

export const keyboardShortcutGroups: ShortcutGroup[] = [
  { labelKey: 'create', shortcuts: navigationShortcuts },
  { labelKey: 'general_settings', shortcuts: generalShortcuts },
];

export interface KeyboardShortcutOverride {
  keys: string;
}

export function resolveShortcutBindings(
  overrides: Record<string, KeyboardShortcutOverride | null> | undefined
) {
  const resolved: Record<string, string | null> = {};

  for (const definition of keyboardShortcuts) {
    const override = overrides?.[definition.id];
    resolved[definition.id] = override ? override.keys : null;
  }

  return resolved;
}
