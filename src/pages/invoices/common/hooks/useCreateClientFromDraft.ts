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
import { $refetch } from '$app/common/hooks/useRefetch';
import { Client } from '$app/common/interfaces/client';
import { ClientContact } from '$app/common/interfaces/client-contact';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankClientQuery } from '$app/common/queries/clients';
import { AxiosError } from 'axios';
import { cloneDeep } from 'lodash';
import { SimplifiedClientDraft } from '../atoms/client-draft';

export class ClientCreationValidationError extends Error {
  errors: ValidationBag;

  constructor(errors: ValidationBag) {
    super('Inline client creation failed validation');
    this.name = 'ClientCreationValidationError';
    this.errors = errors;
  }
}

export function useCreateClientFromDraft() {
  const { data: blankClient } = useBlankClientQuery({
    refetchOnWindowFocus: false,
  });

  return async (draft: SimplifiedClientDraft): Promise<Client> => {
    if (!blankClient) {
      throw new Error('Blank client template not loaded yet');
    }

    const payload = cloneDeep(blankClient) as Client;
    payload.name = draft.name;
    payload.phone = draft.phone;
    payload.address1 = draft.address1;
    payload.city = draft.city;
    payload.postal_code = draft.postal_code;
    payload.country_id = draft.country_id;

    const contact: Partial<ClientContact> = {
      first_name: draft.first_name,
      last_name: draft.last_name,
      email: draft.email,
      send_email: true,
      cc_only: false,
    };
    (payload as unknown as { contacts: Partial<ClientContact>[] }).contacts = [
      contact,
    ];

    try {
      const response = await request(
        'POST',
        endpoint('/api/v1/clients'),
        payload
      );

      $refetch(['clients']);

      window.dispatchEvent(
        new CustomEvent('invalidate.combobox.queries', {
          detail: { url: endpoint('/api/v1/clients') },
        })
      );

      return response.data.data as Client;
    } catch (error) {
      const axiosError = error as AxiosError<ValidationBag>;
      if (axiosError.response?.status === 422 && axiosError.response.data) {
        throw new ClientCreationValidationError(axiosError.response.data);
      }
      throw error;
    }
  };
}
