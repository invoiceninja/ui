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
import { Invoice } from '$app/common/interfaces/invoice';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';

interface Params {
  resource: Invoice | undefined;
  enableQuery: boolean;
  onFinished?: () => void;
}

export interface EntityError {
  field: string;
  label?: string;
}

export interface ValidationEntityResponse {
  passes: boolean;
  invoice: string[];
  client: EntityError[];
  company: EntityError[];
}

export function useCheckEInvoiceValidation(params: Params) {
  const { resource, enableQuery, onFinished } = params;

  const isEntityValidationQueryEnabled =
    import.meta.env.VITE_ENABLE_PEPPOL_STANDARD === 'true';

  const queryClient = useQueryClient();

  const [validationEntityResponse, setValidationEntityResponse] = useState<
    ValidationEntityResponse | undefined
  >();

  const handleCheckValidation = async () => {
    const validationResponse = await queryClient.fetchQuery(
      ['/api/v1/einvoice/validateEntity', resource?.id],
      () =>
        request('POST', endpoint('/api/v1/einvoice/validateEntity'), {
          entity: 'invoices',
          entity_id: resource?.id,
        })
          .then((response) => response)
          .catch((error) => error.response),
      { staleTime: Infinity }
    );

    let currentValidationResult = {
      client: [],
      company: [],
      invoice: [],
      passes: true,
    };

    if (validationResponse?.status === 422) {
      currentValidationResult = {
        company: validationResponse.data.company ?? [],
        client: validationResponse.data.client ?? [],
        invoice: validationResponse.data.invoice ?? [],
        passes: false,
      };
    }

    setValidationEntityResponse(cloneDeep(currentValidationResult));

    onFinished?.();
  };

  useEffect(() => {
    if (enableQuery && resource && isEntityValidationQueryEnabled) {
      handleCheckValidation();
    }
  }, [enableQuery, resource]);

  return { validationResponse: validationEntityResponse };
}
