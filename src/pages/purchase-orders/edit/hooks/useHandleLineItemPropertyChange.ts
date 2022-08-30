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

export function useHandleLineItemPropertyChange(
  setPurchaseOrder: (purchaseOrder: PurchaseOrder) => unknown,
  setInvoiceSum: (invoiceSum: InvoiceSum) => unknown
) {
  const calculateInvoiceSum = useCalculateInvoiceSum(setInvoiceSum);

  return async (
    purchaseOrder: PurchaseOrder,
    property: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => {
    const po = cloneDeep(purchaseOrder) as PurchaseOrder;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    po.line_items[index][property] = value;

    setPurchaseOrder(await calculateInvoiceSum(po));
  };
}
