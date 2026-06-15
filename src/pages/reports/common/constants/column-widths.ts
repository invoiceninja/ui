/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2025. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

const SMALL_MIN_WIDTH = 90;
const MEDIUM_MIN_WIDTH = 140;
const LARGE_MIN_WIDTH = 200;
const NOTES_MIN_WIDTH = 280;

export const smallWidthColumns = [
  '.number',
  '.po_number',
  '.id_number',
  '.vat_number',
  '.amount',
  '.foreign_amount',
  '.balance',
  '.subtotal',
  '.paid_to_date',
  '.credit_balance',
  '.payment_balance',
  '.discount',
  '.partial',
  '.refunded',
  '.applied',
  '.cost',
  '.price',
  '.rate',
  '.quantity',
  '.in_stock_quantity',
  '.exchange_rate',
  '.total_taxes',
  '.tax_amount',
  '.tax_amount1',
  '.tax_amount2',
  '.tax_amount3',
  '.tax_rate1',
  '.tax_rate2',
  '.tax_rate3',
  '.tax_id',
  '.custom_surcharge1',
  '.custom_surcharge2',
  '.custom_surcharge3',
  '.custom_surcharge4',
  '.date',
  '.due_date',
  '.partial_due_date',
  '.payment_date',
  '.start_date',
  '.end_date',
  '.next_send_date',
  '.start_time',
  '.end_time',
  '.duration',
  '.status',
  '.status_id',
  '.currency',
  '.currency_id',
  '.invoice_currency_id',
  '.size_id',
  '.type_id',
  '.invoice_id',
  '.recurring_id',
  '.postal_code',
  '.shipping_postal_code',
  '.remaining_cycles',
  '.auto_bill',
  '.auto_bill_enabled',
  '.uses_inclusive_taxes',
  '.is_amount_discount',
  '.billable',
];

export const mediumWidthColumns = [
  '.first_name',
  '.last_name',
  '.user',
  '.user_id',
  '.assigned_user',
  '.assigned_user_id',
  '.phone',
  '.tax_name1',
  '.tax_name2',
  '.tax_name3',
  '.custom_value1',
  '.custom_value2',
  '.custom_value3',
  '.custom_value4',
  '.duration_words',
  '.time_log_duration_words',
  '.classification',
  '.method',
  '.payment_type_id',
  '.payment_terms',
  '.frequency_id',
  '.country_id',
  '.shipping_country_id',
  '.industry_id',
  '.category',
  '.project_id',
  '.product_key',
  '.city',
  '.shipping_city',
  '.state',
  '.shipping_state',
];

export const largeWidthColumns = [
  '.name',
  '.email',
  '.website',
  '.transaction_reference',
  '.time_log',
  '.tags',
  '.address1',
  '.address2',
  '.shipping_address1',
  '.shipping_address2',
];

export const notesWidthColumns = [
  '.public_notes',
  '.private_notes',
  '.notes',
  '.item_notes',
  '.description',
  '.terms',
  '.footer',
  '.reminder_schedule',
];

export const truncatedColumns = [
  '.public_notes',
  '.private_notes',
  '.notes',
  '.item_notes',
  '.description',
  '.terms',
  '.footer',
  '.reminder_schedule',
];

const matchesSuffix = (identifier: string, suffixes: string[]) => {
  return suffixes.some((suffix) => identifier.endsWith(suffix)) ?? false;
};

export const resolveMinColumnWidth = (identifier: string): number => {
  if (matchesSuffix(identifier, notesWidthColumns)) {
    return NOTES_MIN_WIDTH;
  }

  if (matchesSuffix(identifier, largeWidthColumns)) {
    return LARGE_MIN_WIDTH;
  }

  if (matchesSuffix(identifier, mediumWidthColumns)) {
    return MEDIUM_MIN_WIDTH;
  }

  if (matchesSuffix(identifier, smallWidthColumns)) {
    return SMALL_MIN_WIDTH;
  }

  return MEDIUM_MIN_WIDTH;
};

export const isTruncatedColumn = (identifier: string): boolean => {
  return matchesSuffix(identifier, truncatedColumns);
};
