/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PurchaseOrderStatus } from '$app/common/enums/purchase-order-status';

export default {
  [PurchaseOrderStatus.Accepted]: 'accepted',
  [PurchaseOrderStatus.Cancelled]: 'canclled',
  [PurchaseOrderStatus.Draft]: 'draft',
  [PurchaseOrderStatus.Received]: 'received',
  [PurchaseOrderStatus.Sent]: 'sent',
};
