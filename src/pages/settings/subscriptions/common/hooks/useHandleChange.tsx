/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Subscription } from '$app/common/interfaces/subscription';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Dispatch, SetStateAction } from 'react';
import { cloneDeep, set } from 'lodash';

interface Params {
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setSubscription: Dispatch<SetStateAction<Subscription | undefined>>;
  subscription: Subscription | undefined;
}

export function useHandleChange(params: Params) {
  return (
    property: keyof Subscription,
    value: Subscription[keyof Subscription]
  ) => {
    params.setErrors(undefined);

    const subscription = cloneDeep(params.subscription);

    params.setSubscription(set(subscription as Subscription, property, value));
  };
}
