/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceSum } from 'common/helpers/invoices/invoice-sum';
import { PurchaseOrder } from 'common/interfaces/purchase-order';
import { useResolveCurrency } from './useResolveCurrency';

export function useCalculateInvoiceSum(
  setInvoiceSum: (invoiceSum: InvoiceSum) => unknown
) {
  const resolveCurrency = useResolveCurrency();

  return async (purchaseOrder: PurchaseOrder) => {
    const currency = await resolveCurrency(purchaseOrder.vendor_id);
    const invoiceSum = new InvoiceSum(purchaseOrder, currency!).build();

    setInvoiceSum(invoiceSum);

    return invoiceSum.invoice as PurchaseOrder;
  };
}
