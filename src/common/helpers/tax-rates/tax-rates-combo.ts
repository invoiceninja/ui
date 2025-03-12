/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { FeesAndLimitsEntry } from '$app/common/interfaces/company-gateway';
import { Expense } from '$app/common/interfaces/expense';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { Product } from '$app/common/interfaces/product';
import { RecurringExpense } from '$app/common/interfaces/recurring-expense';
import { ProductTableResource } from '$app/pages/invoices/common/components/ProductsTable';

type Resource =
  | Expense
  | ProductTableResource
  | InvoiceItem
  | Product
  | RecurringExpense
  | FeesAndLimitsEntry;

export type TaxNamePropertyType =
  | (
      | 'tax_name1'
      | 'tax_name2'
      | 'tax_name3'
      | 'fee_tax_name1'
      | 'fee_tax_name2'
      | 'fee_tax_name3'
    )
  | undefined;

export function getTaxRateComboValue(
  resource: Resource | undefined,
  nameProperty: TaxNamePropertyType
): string {
  if (!nameProperty) return '';

  const taxRateProp = nameProperty.replace('name', 'rate') as keyof Resource;

  if (resource && resource[taxRateProp]) {
    return `${resource[nameProperty as keyof Resource]}||${
      resource[taxRateProp]
    }`;
  }

  return '';
}
