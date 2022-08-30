/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PurchaseOrder } from 'common/interfaces/purchase-order';
import { cloneDeep } from 'lodash';

export function useHandleDeleteLineItem(
  setPurchaseOrder: (po: PurchaseOrder) => unknown
) {
  return async (purchaseOrder: PurchaseOrder, index: number) => {
    const po = cloneDeep(purchaseOrder);

    po.line_items.splice(index, 1);

    setPurchaseOrder(po);
  };
}
