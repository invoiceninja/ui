/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PaymentTerm } from '$app/common/interfaces/payment-term';

export function shouldPaymentTermBeVisible(
  paymentTerm: PaymentTerm,
  currentValue: string | undefined
): boolean {
  const isActive = !paymentTerm.is_deleted && !paymentTerm.archived_at;
  const isCurrentlySelected = paymentTerm.num_days.toString() === currentValue;

  return isActive || isCurrentlySelected;
}

export function isUniquePaymentTerm(
  paymentTerm: PaymentTerm,
  index: number,
  paymentTerms: PaymentTerm[]
): boolean {
  return (
    paymentTerms.findIndex((t) => t.num_days === paymentTerm.num_days) === index
  );
}
