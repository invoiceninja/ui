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

export function matchesPaymentTerm(
  paymentTerm: PaymentTerm,
  days: string | undefined,
  cashDiscountDays?: string | undefined,
  cashDiscountPercent?: string | undefined
): boolean {
  return (
    (days || '') === (paymentTerm.num_days?.toString() || '') &&
    (cashDiscountDays || '') ===
      (paymentTerm.cash_discount_days?.toString() || '') &&
    (cashDiscountPercent || '') ===
      (paymentTerm.cash_discount_percent?.toString() || '')
  );
}

export function shouldPaymentTermBeVisible(
  paymentTerm: PaymentTerm,
  days: string | undefined,
  cashDiscountDays?: string | undefined,
  cashDiscountPercent?: string | undefined
): boolean {
  const isActive = !paymentTerm.is_deleted && !paymentTerm.archived_at;
  const isCurrentlySelected = matchesPaymentTerm(
    paymentTerm,
    days,
    cashDiscountDays,
    cashDiscountPercent
  );

  return isActive || isCurrentlySelected;
}

export function isUniquePaymentTerm(
  paymentTerm: PaymentTerm,
  index: number,
  paymentTerms: PaymentTerm[]
): boolean {
  return (
    paymentTerms.findIndex((term) =>
      matchesPaymentTerm(
        paymentTerm,
        term.num_days?.toString(),
        term.cash_discount_days?.toString(),
        term.cash_discount_percent?.toString()
      )
    ) === index
  );
}
