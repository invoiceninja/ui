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
import { InvoiceItem } from 'common/interfaces/invoice-item';
import { PurchaseOrder } from 'common/interfaces/purchase-order';
import { cloneDeep } from 'lodash';
import { useCalculateInvoiceSum } from './useCalculateInvoiceSum';

export function useHandleProductChange(
  setPurchaseOrder: (purchaseOrder: PurchaseOrder) => unknown,
  setInvoiceSum: (invoiceSum: InvoiceSum) => unknown
) {
  const calculateInvoiceSum = useCalculateInvoiceSum(setInvoiceSum);

  return async (
    purchaseOrder: PurchaseOrder,
    index: number,
    lineItem: InvoiceItem
  ) => {
    const po = cloneDeep(purchaseOrder) as PurchaseOrder;

    po.line_items[index] = lineItem;

    setPurchaseOrder(await calculateInvoiceSum(po));
  };
}
