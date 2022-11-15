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
import { useQuery } from 'react-query';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { BankAccountDetails } from 'common/interfaces/bank-accounts';

export function useBankAccountsQuery(params: { id: string | undefined }) {
  return useQuery<BankAccountDetails>(
    ['/api/v1/bank_integrations/:id', { id: params.id }],
    () =>
      request(
        'GET',
        endpoint('/api/v1/bank_integrations/:id', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<BankAccountDetails>) =>
          response.data.data
      )
  );
}
