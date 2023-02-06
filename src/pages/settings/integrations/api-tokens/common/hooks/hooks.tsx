/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ApiToken } from 'common/interfaces/api-token';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { Dispatch, SetStateAction } from 'react';

interface HandleChangeApiTokenParams {
  setApiToken: Dispatch<SetStateAction<ApiToken | undefined>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
}

export function useHandleChange(params: HandleChangeApiTokenParams) {
  const { setApiToken, setErrors } = params;

  return <T extends keyof ApiToken>(
    property: T,
    value: ApiToken[typeof property]
  ) => {
    setErrors(undefined);

    setApiToken(
      (currentApiToken) =>
        currentApiToken && { ...currentApiToken, [property]: value }
    );
  };
}
