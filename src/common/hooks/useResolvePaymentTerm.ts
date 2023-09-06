/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PaymentTerm } from '../interfaces/payment-term';
import { usePaymentTermsQuery } from '../queries/payment-terms';

interface Params {
  resolveWithNumDays?: boolean;
}
export function useResolvePaymentTerm(params?: Params) {
  const { resolveWithNumDays } = params || {};

  const { data: paymentTerms } = usePaymentTermsQuery({});

  if (resolveWithNumDays) {
    return (numDays: string) =>
      paymentTerms?.data.data.find(
        (paymentTerm: PaymentTerm) => paymentTerm.num_days === Number(numDays)
      );
  }

  return (id: string) =>
    paymentTerms?.data.data.find(
      (paymentTerm: PaymentTerm) => paymentTerm.id === id
    );
}
