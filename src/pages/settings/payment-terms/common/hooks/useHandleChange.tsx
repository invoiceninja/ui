/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PaymentTerm } from 'common/interfaces/payment-term';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { Dispatch, SetStateAction } from 'react';

interface Params {
  setPaymentTerm: Dispatch<SetStateAction<PaymentTerm | undefined>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
}

export function useHandleChange(params: Params) {
  const { setPaymentTerm, setErrors } = params;

  return <T extends keyof PaymentTerm>(
    property: T,
    value: PaymentTerm[typeof property]
  ) => {
    setErrors(undefined);

    setPaymentTerm(
      (currentPaymentTerm) =>
        currentPaymentTerm && { ...currentPaymentTerm, [property]: value }
    );
  };
}
