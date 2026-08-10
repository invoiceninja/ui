import type { BlockType } from '../types';

/**
 * Stable public selectors for custom invoice CSS.
 *
 * These names are part of the saved-design contract. Keep them independent of
 * builder/editor classes so UI refactors do not break a customer's CSS.
 */
export const INVOICE_WIDGET_CLASS = 'invoice-widget';

export const INVOICE_WIDGET_CLASS_BY_TYPE = {
  text: 'invoice-widget--text',
  image: 'invoice-widget--image',
  logo: 'invoice-widget--logo',
  table: 'invoice-widget--table',
  'tasks-table': 'invoice-widget--tasks-table',
  divider: 'invoice-widget--divider',
  spacer: 'invoice-widget--spacer',
  total: 'invoice-widget--total',
  qrcode: 'invoice-widget--qrcode',
  signature: 'invoice-widget--signature',
  'client-info': 'invoice-widget--client-info',
  'client-shipping-info': 'invoice-widget--client-shipping-info',
  'company-info': 'invoice-widget--company-info',
  'invoice-details': 'invoice-widget--invoice-details',
  'public-notes': 'invoice-widget--public-notes',
  footer: 'invoice-widget--footer',
  terms: 'invoice-widget--terms',
} as const satisfies Record<BlockType, string>;

const CUSTOM_WIDGET_CLASS_PATTERN = /^-?[_a-zA-Z][-_a-zA-Z0-9]*$/;
const CUSTOM_WIDGET_CLASS_LIMIT = 20;
const CUSTOM_WIDGET_CLASS_LENGTH_LIMIT = 128;

/**
 * Normalize the user-editable, whitespace-separated widget class property.
 * Keeping this to ordinary CSS identifiers makes the resulting selectors
 * usable without escaping and prevents malformed generated class attributes.
 */
export function normalizeCustomWidgetClasses(value: unknown): string[] {
  if (typeof value !== 'string') {
    return [];
  }

  return Array.from(
    new Set(
      value
        .trim()
        .split(/\s+/)
        .filter(
          (className) =>
            className.length <= CUSTOM_WIDGET_CLASS_LENGTH_LIMIT &&
            CUSTOM_WIDGET_CLASS_PATTERN.test(className)
        )
    )
  ).slice(0, CUSTOM_WIDGET_CLASS_LIMIT);
}

export function getInvoiceWidgetClassName(
  type: BlockType,
  customClasses?: unknown
): string {
  return Array.from(
    new Set([
      INVOICE_WIDGET_CLASS,
      INVOICE_WIDGET_CLASS_BY_TYPE[type],
      ...normalizeCustomWidgetClasses(customClasses),
    ])
  ).join(' ');
}
