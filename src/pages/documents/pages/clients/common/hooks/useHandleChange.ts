/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client, ClientContact } from '$app/common/interfaces/docuninja/api';
import { cloneDeep, set } from 'lodash';
import { Dispatch, SetStateAction } from 'react';

interface Params {
  setClient: Dispatch<SetStateAction<Client | undefined>>;
}

export function useHandleChange({ setClient }: Params) {
  return (key: string, value: string | number | boolean | ClientContact[]) => {
    setClient((current) => {
      if (!current) return current;

      const updatedClient = cloneDeep(current);

      set(updatedClient, key, value);

      return updatedClient;
    });
  };
}
