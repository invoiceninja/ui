/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PaymentStatus } from 'common/enums/payment-status';

export default {
  [PaymentStatus.PartiallyUnapplied]: 'partially_unapplied',
  [PaymentStatus.Unapplied]: 'unapplied',
  [PaymentStatus.Pending]: 'pending',
  [PaymentStatus.Cancelled]: 'cancelled',
  [PaymentStatus.Failed]: 'failed',
  [PaymentStatus.Completed]: 'completed',
  [PaymentStatus.PartiallyRefunded]: 'partially_refunded',
  [PaymentStatus.Refunded]: 'refunded',
};
