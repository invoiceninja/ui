/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Client } from '$app/common/interfaces/client';
import { ClientContact } from '$app/common/interfaces/client-contact';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { Dispatch, SetStateAction } from 'react';

interface Params {
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
}

export type ContactChanges = Partial<
  Pick<ClientContact, 'first_name' | 'last_name' | 'email'>
>;

export function useSaveClientContact({ setErrors }: Params) {
  return (client: Client, changes: ContactChanges): Promise<Client | null> => {
    setErrors(undefined);

    const existing = (client.contacts ?? []).map((entry) => {
      const { password, ...rest } = entry;

      return rest;
    });

    const contacts = existing.length
      ? existing.map((entry, index) =>
          index === 0 ? { ...entry, ...changes, send_email: true } : entry
        )
      : [{ ...changes, send_email: true }];

    return request(
      'PUT',
      endpoint('/api/v1/clients/:id', { id: client.id }),
      { ...client, contacts, documents: [] },
      { skipIntercept: true }
    )
      .then((response) => {
        const saved = response.data.data as Client;

        $refetch(['clients']);

        return saved;
      })
      .catch((caught: AxiosError<ValidationBag>) => {
        if (caught.response?.status === 422) {
          setErrors(caught.response.data);
        } else {
          toast.error();
        }

        return null;
      });
  };
}
