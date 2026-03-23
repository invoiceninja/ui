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
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Payment } from '$app/common/interfaces/payment';
import { useQuery } from 'react-query';

interface Params {
  clientId: string | undefined;
}

export function useUnappliedPayments({ clientId }: Params) {
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['/api/v1/payments', clientId, 'partially_unapplied'],
    queryFn: () =>
      request(
        'GET',
        endpoint(
          `/api/v1/payments?client_id=:client_id&client_status=partially_unapplied`,
          { client_id: clientId }
        )
      ).then(
        (response: GenericSingleResourceResponse<Payment[]>) =>
          response.data.data
      ),
    enabled: Boolean(clientId),
    staleTime: Infinity,
  });

  return {
    payments,
    isLoading,
  };
}
