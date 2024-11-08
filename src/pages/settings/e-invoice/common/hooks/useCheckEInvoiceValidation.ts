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
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';

interface Params {
  entity: 'clients' | 'invoices' | 'companies';
  entity_id: string;
  enableQuery: boolean;
}

interface ValidationEntityResponse {
  passes: boolean;
  invoice: string[];
  client: string[];
  company: string[];
}

export function useCheckEInvoiceValidation(params: Params) {
  const { entity, entity_id, enableQuery } = params;

  const queryClient = useQueryClient();

  const [isValid, setIsValid] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<
    ValidationEntityResponse | undefined
  >();

  const handleCheckValidation = async () => {
    const response = await queryClient
      .fetchQuery(
        ['/api/v1/einvoice/validateEntity', entity_id],
        () =>
          request('POST', endpoint('/api/v1/einvoice/validateEntity'), {
            entity,
            entity_id,
          }).then((response) => response),
        { staleTime: Infinity }
      )
      .catch((error: AxiosError<ValidationEntityResponse>) => {
        if (error.response?.status === 422) {
          setValidationErrors(error.response.data);
          toast.dismiss();
        }
      });

    setIsValid(Boolean(response));
  };

  useEffect(() => {
    if (enableQuery) {
      handleCheckValidation();
    }
  }, [enableQuery]);

  return { isValid, errors: validationErrors };
}
