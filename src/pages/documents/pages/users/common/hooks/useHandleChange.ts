/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { User } from '$app/common/interfaces/docuninja/api';
import { cloneDeep, set } from 'lodash';
import { Dispatch, SetStateAction } from 'react';

interface Params {
  setUser: Dispatch<SetStateAction<User | undefined>>;
}

export function useHandleChange({ setUser }: Params) {
  return (key: string, value: string | number | boolean) => {
    setUser((current) => {
      if (!current) return current;

      const updatedUser = cloneDeep(current);

      set(updatedUser, key, value);

      return updatedUser;
    });
  };
}
