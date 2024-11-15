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
import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';

interface Params {
  entity: 'clients' | 'invoices' | 'companies';
  entity_id: string;
  enableQuery: boolean;
}

export function useCheckEInvoiceValidation(params: Params) {
  const { entity, entity_id, enableQuery } = params;

  const queryClient = useQueryClient();

  const [isValid, setIsValid] = useState<boolean>(true);

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
      .catch((error) => {
        if (error.response?.status === 400) {
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

  return { isValid };
}
