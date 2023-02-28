/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { TransactionRule } from 'common/interfaces/transaction-rules';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { Dispatch, SetStateAction } from 'react';

interface Params {
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setTransactionRule: Dispatch<SetStateAction<TransactionRule | undefined>>;
}

export function useHandleChange(params: Params) {
  const { setErrors, setTransactionRule } = params;

  return (
    property: keyof TransactionRule,
    value: TransactionRule[keyof TransactionRule]
  ) => {
    setErrors(undefined);

    setTransactionRule(
      (currentTransactionRule) =>
        currentTransactionRule && {
          ...currentTransactionRule,
          [property]: value,
        }
    );
  };
}
