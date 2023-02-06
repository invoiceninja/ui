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
import { route } from 'common/helpers/route';
import { TransactionRule } from 'common/interfaces/transaction-rules';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';

export function useBlankTransactionRuleQuery() {
  return useQuery<TransactionRule>(
    route('/api/v1/bank_transaction_rules/create'),
    () =>
      request('GET', endpoint('/api/v1/bank_transaction_rules/create')).then(
        (response: GenericSingleResourceResponse<TransactionRule>) =>
          response.data.data
      )
  );
}

export function useTransactionRuleQuery(params: { id: string | undefined }) {
  return useQuery<TransactionRule>(
    route('/api/v1/bank_transaction_rules/:id', { id: params.id }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/bank_transaction_rules/:id', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<TransactionRule>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}
