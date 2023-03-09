/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { blankLineItem } from '$app/common/constants/blank-line-item';
import { cloneDeep } from 'lodash';

export function useHandleCreateLineItem(
  setPurchaseOrder: (purchaseOrder: PurchaseOrder) => unknown
) {
  return async (purchaseOrder: PurchaseOrder) => {
    const po = cloneDeep(purchaseOrder) as PurchaseOrder;

    po.line_items.push(blankLineItem());

    setPurchaseOrder(po);
  };
}
