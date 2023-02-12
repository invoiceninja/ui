/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { TaxRate } from 'common/interfaces/tax-rate';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { Dispatch, SetStateAction } from 'react';

interface Params {
  setTaxRate: Dispatch<SetStateAction<TaxRate | undefined>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
}

export function useHandleChange(params: Params) {
  const { setTaxRate, setErrors } = params;

  return <T extends keyof TaxRate>(
    property: T,
    value: TaxRate[typeof property]
  ) => {
    setErrors(undefined);

    setTaxRate(
      (currentTaxRate) =>
        currentTaxRate && { ...currentTaxRate, [property]: value }
    );
  };
}
