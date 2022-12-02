/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { Invoice } from 'common/interfaces/invoice';
import { Params } from 'common/queries/common/params.interface';
import { useQuery } from 'react-query';

interface InvoicesParams extends Params {
  client_status?: string;
  client_id?: string;
}

export function useInvoicesQuery(params?: InvoicesParams) {
  return useQuery<Invoice[]>(
    ['/api/v1/invoices', params],
    () =>
      request(
        'GET',
        endpoint(
          '/api/v1/invoices?client_status=:client_status&filter=:filter&client_id=:client_id',
          {
            client_status: params?.client_status,
            filter: params?.filter,
            client_id: params?.client_id,
          }
        )
      ).then(
        (response: GenericSingleResourceResponse<Invoice[]>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}
