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
import { useQuery } from 'react-query';

export function useInvoicesQuery() {
  return useQuery<Invoice[]>(
    '/api/v1/invoices',
    () =>
      request('GET', endpoint('/api/v1/invoices')).then(
        (response: GenericSingleResourceResponse<Invoice[]>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}
