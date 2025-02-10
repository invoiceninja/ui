/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { cloneDeep, set } from 'lodash';

export function useHandleLineItemPropertyChange(
  setPurchaseOrder: (purchaseOrder: PurchaseOrder) => unknown
) {
  return (
    purchaseOrder: PurchaseOrder,
    property: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => {
    const updatedPurchaseOrder = cloneDeep(purchaseOrder) as PurchaseOrder;

    if (updatedPurchaseOrder.line_items[index][property] === value) {
      return;
    }

    set(updatedPurchaseOrder, `line_items.${index}.${property}`, value);

    setPurchaseOrder(updatedPurchaseOrder);
  };
}
