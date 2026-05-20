/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const numberFormattableColumns = [
  '.amount',
  '.balance',
  '.discount',
  '.partial',
  '.paid_to_date',
  '.custom_value1',
  '.custom_value2',
  '.custom_value3',
  '.custom_value4',
  '.credit_balance',
  '.payment_balance',
  '.custom_surcharge1',
  '.custom_surcharge2',
  '.custom_surcharge3',
  '.custom_surcharge4',
  '.exchange_rate',
  '.total_taxes',
  '.tax_rate1',
  '.tax_rate2',
  '.tax_rate3',
  '.foreign_amount',
  '.tax_amount1',
  '.tax_amount2',
  '.tax_amount3',
  '.quantity',
  '.discount',
  '.cost',
  '.tax_amount',
  '.refunded',
  '.applied',
  '.rate',
];

// Columns whose values represent additive monetary amounts or quantities and
// therefore make sense to sum in the report totals row. Anything not listed
// here — identifiers (.number, .po_number), rates (.exchange_rate, .tax_rate1),
// foreign-key ids (.currency_id, .status_id), booleans, names, or
// free-form custom values — is intentionally excluded because summing those
// produces meaningless numbers (e.g. summing invoice numbers).
//
// Each entry is a suffix matched against the column identifier with
// `endsWith`. Suffixes are used because the same metric (e.g. `.amount`) lives
// on many entities (`invoice.amount`, `credit.amount`, `payment.amount`...)
// and we want a single rule for all of them.
export const summableColumns = [
  // Monetary amounts on invoice-like entities (invoice, credit, quote,
  // recurring_invoice, purchase_order), payment, expense.
  '.amount',
  '.foreign_amount', // expense.foreign_amount
  '.subtotal',
  '.balance',
  '.paid_to_date',
  '.credit_balance', // client.credit_balance
  '.payment_balance', // client.payment_balance
  '.discount',
  '.partial', // partial amount owed on an invoice-like entity
  '.refunded', // payment.refunded
  '.applied', // payment.applied
  // Custom surcharges (line-item monetary additions).
  '.custom_surcharge1',
  '.custom_surcharge2',
  '.custom_surcharge3',
  '.custom_surcharge4',
  // Tax amounts (monetary, not rates).
  '.total_taxes',
  '.tax_amount',
  '.tax_amount1',
  '.tax_amount2',
  '.tax_amount3',
  // Line-item quantities and unit costs (item.quantity, item.cost,
  // product.quantity, product.cost).
  '.quantity',
  '.cost',
  // Product report fields (product.price = unit sell price,
  // product.in_stock_quantity = warehouse stock level).
  '.price',
  '.in_stock_quantity',
  // Task duration in seconds (summing yields total worked time).
  '.duration',
];

export const isSummableColumn = (identifier: string) => {
  return summableColumns.some((suffix) => identifier.endsWith(suffix));
};
