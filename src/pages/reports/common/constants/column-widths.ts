/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2025. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CSSProperties } from 'react';

export interface ColumnWidth {
  suffix: string;
  width: number;
  truncate?: boolean;
}

export interface ResolvedCellSizing {
  width: number;
  minWidth: number;
  truncate: boolean;
  style: CSSProperties;
}

const HEADER_MIN_WIDTH = 90;

const NARROW = 90;
const SMALL = 120;
const MEDIUM = 160;
const LARGE = 220;
const XLARGE = 280;
const NOTES = 320;

const FALLBACK_WIDTH = MEDIUM;

export const columnWidths: ColumnWidth[] = [
  { suffix: '.number', width: SMALL },
  { suffix: '.po_number', width: SMALL },
  { suffix: '.id_number', width: SMALL },
  { suffix: '.vat_number', width: SMALL },
  { suffix: '.transaction_reference', width: LARGE },

  { suffix: '.name', width: LARGE },
  { suffix: '.first_name', width: MEDIUM },
  { suffix: '.last_name', width: MEDIUM },
  { suffix: '.user', width: MEDIUM },
  { suffix: '.user_id', width: MEDIUM },
  { suffix: '.assigned_user', width: MEDIUM },
  { suffix: '.assigned_user_id', width: MEDIUM },
  { suffix: '.recurring_id', width: SMALL },

  { suffix: '.email', width: LARGE },
  { suffix: '.phone', width: MEDIUM },
  { suffix: '.website', width: LARGE },

  { suffix: '.amount', width: SMALL },
  { suffix: '.foreign_amount', width: SMALL },
  { suffix: '.balance', width: SMALL },
  { suffix: '.subtotal', width: SMALL },
  { suffix: '.paid_to_date', width: SMALL },
  { suffix: '.credit_balance', width: SMALL },
  { suffix: '.payment_balance', width: SMALL },
  { suffix: '.discount', width: SMALL },
  { suffix: '.partial', width: SMALL },
  { suffix: '.refunded', width: SMALL },
  { suffix: '.applied', width: SMALL },
  { suffix: '.cost', width: SMALL },
  { suffix: '.price', width: SMALL },
  { suffix: '.rate', width: SMALL },
  { suffix: '.quantity', width: NARROW },
  { suffix: '.in_stock_quantity', width: NARROW },
  { suffix: '.exchange_rate', width: SMALL },

  { suffix: '.total_taxes', width: SMALL },
  { suffix: '.tax_amount', width: SMALL },
  { suffix: '.tax_amount1', width: SMALL },
  { suffix: '.tax_amount2', width: SMALL },
  { suffix: '.tax_amount3', width: SMALL },
  { suffix: '.tax_rate1', width: NARROW },
  { suffix: '.tax_rate2', width: NARROW },
  { suffix: '.tax_rate3', width: NARROW },
  { suffix: '.tax_name1', width: MEDIUM },
  { suffix: '.tax_name2', width: MEDIUM },
  { suffix: '.tax_name3', width: MEDIUM },
  { suffix: '.tax_id', width: SMALL },

  { suffix: '.custom_surcharge1', width: SMALL },
  { suffix: '.custom_surcharge2', width: SMALL },
  { suffix: '.custom_surcharge3', width: SMALL },
  { suffix: '.custom_surcharge4', width: SMALL },
  { suffix: '.custom_value1', width: MEDIUM },
  { suffix: '.custom_value2', width: MEDIUM },
  { suffix: '.custom_value3', width: MEDIUM },
  { suffix: '.custom_value4', width: MEDIUM },

  { suffix: '.date', width: SMALL },
  { suffix: '.due_date', width: SMALL },
  { suffix: '.partial_due_date', width: SMALL },
  { suffix: '.payment_date', width: SMALL },
  { suffix: '.start_date', width: SMALL },
  { suffix: '.end_date', width: SMALL },
  { suffix: '.next_send_date', width: SMALL },
  { suffix: '.start_time', width: SMALL },
  { suffix: '.end_time', width: SMALL },
  { suffix: '.duration', width: SMALL },
  { suffix: '.duration_words', width: MEDIUM },
  { suffix: '.time_log_duration_words', width: MEDIUM },
  { suffix: '.time_log', width: LARGE },

  { suffix: '.status', width: SMALL },
  { suffix: '.status_id', width: SMALL },
  { suffix: '.classification', width: MEDIUM },
  { suffix: '.method', width: MEDIUM },
  { suffix: '.payment_type_id', width: MEDIUM },
  { suffix: '.payment_terms', width: MEDIUM },
  { suffix: '.frequency_id', width: MEDIUM },
  { suffix: '.remaining_cycles', width: NARROW },
  { suffix: '.auto_bill', width: NARROW },
  { suffix: '.auto_bill_enabled', width: NARROW },
  { suffix: '.uses_inclusive_taxes', width: NARROW },
  { suffix: '.is_amount_discount', width: NARROW },
  { suffix: '.billable', width: NARROW },

  { suffix: '.currency', width: SMALL },
  { suffix: '.currency_id', width: SMALL },
  { suffix: '.invoice_currency_id', width: SMALL },
  { suffix: '.country_id', width: MEDIUM },
  { suffix: '.shipping_country_id', width: MEDIUM },
  { suffix: '.industry_id', width: MEDIUM },
  { suffix: '.size_id', width: SMALL },
  { suffix: '.type_id', width: SMALL },
  { suffix: '.category', width: MEDIUM },
  { suffix: '.invoice_id', width: SMALL },
  { suffix: '.project_id', width: MEDIUM },
  { suffix: '.product_key', width: MEDIUM },
  { suffix: '.tags', width: LARGE },

  { suffix: '.address1', width: LARGE },
  { suffix: '.address2', width: LARGE },
  { suffix: '.shipping_address1', width: LARGE },
  { suffix: '.shipping_address2', width: LARGE },
  { suffix: '.city', width: MEDIUM },
  { suffix: '.shipping_city', width: MEDIUM },
  { suffix: '.state', width: MEDIUM },
  { suffix: '.shipping_state', width: MEDIUM },
  { suffix: '.postal_code', width: SMALL },
  { suffix: '.shipping_postal_code', width: SMALL },

  { suffix: '.public_notes', width: NOTES, truncate: true },
  { suffix: '.private_notes', width: NOTES, truncate: true },
  { suffix: '.notes', width: NOTES, truncate: true },
  { suffix: '.item_notes', width: NOTES, truncate: true },
  { suffix: '.description', width: NOTES, truncate: true },
  { suffix: '.terms', width: XLARGE, truncate: true },
  { suffix: '.footer', width: XLARGE, truncate: true },
  { suffix: '.reminder_schedule', width: XLARGE, truncate: true },
];

const widthByExactSuffix = new Map(
  columnWidths.map((column) => [column.suffix, column])
);

const FALLBACK_COLUMN: ColumnWidth = { suffix: '', width: FALLBACK_WIDTH };

export function resolveColumnWidth(identifier: string): ColumnWidth {
  const exact = widthByExactSuffix.get(`.${identifier.split('.').pop() ?? ''}`);

  if (exact) {
    return exact;
  }

  const longest = columnWidths
    .filter((column) => identifier.endsWith(column.suffix))
    .sort((a, b) => b.suffix.length - a.suffix.length)[0];

  return longest ?? FALLBACK_COLUMN;
}

export function resolveMinColumnWidth(displayValue: string): number {
  const labelWidth = Math.ceil(displayValue.length * 7.5);
  const chrome = 32 + 24;

  return Math.max(HEADER_MIN_WIDTH, labelWidth + chrome);
}

export function resolveCellSizing(
  identifier: string,
  displayValue: string
): ResolvedCellSizing {
  const column = resolveColumnWidth(identifier);
  const minWidth = resolveMinColumnWidth(displayValue);
  const width = Math.max(column.width, minWidth);

  return {
    width,
    minWidth,
    truncate: column.truncate === true,
    style: { width, minWidth },
  };
}
