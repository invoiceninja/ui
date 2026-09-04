/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Payment } from '$app/common/interfaces/payment';

export const showDeletePaymentAction = (payment: Payment) => {
  return !payment.invoices?.some(({ is_deleted }) => is_deleted);
};
