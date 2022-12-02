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
import { route } from 'common/helpers/route';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { TransactionResponse } from 'common/interfaces/transactions';
import { useExpenseCategoriesQuery } from 'common/queries/expense-categories';
import { useVendorsQuery } from 'common/queries/vendor';
import { useInvoicesQuery } from 'pages/invoices/common/queries';
import { useQuery } from 'react-query';

export function useTransactionQuery(params: { id: string | undefined }) {
  return useQuery<TransactionResponse>(
    route('/api/v1/bank_transactions/:id', { id: params.id }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/bank_transactions/:id', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<TransactionResponse>) =>
          response?.data?.data
      )
  );
}

export function useTransactionMatchResourceQuery(
  dataKey: 'invoices' | 'vendors' | 'categories',
  filter?: string,
  clientId?: string
) {
  if (dataKey === 'invoices') {
    return useInvoicesQuery({
      client_status: 'unpaid',
      filter,
      client_id: clientId,
    });
  }

  if (dataKey === 'vendors') {
    return useVendorsQuery({ filter });
  }

  return useExpenseCategoriesQuery({ filter });
}
