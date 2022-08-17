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
import { Expense } from 'common/interfaces/expense';
import { useQuery } from 'react-query';
import { generatePath } from 'react-router-dom';

export function useBlankExpenseQuery() {
  return useQuery<Expense>(
    generatePath('/api/v1/expenses/create'),
    () =>
      request('GET', endpoint('/api/v1/expenses/create')).then(
        (response) => response.data.data
      ),
    { staleTime: Infinity }
  );
}

export function useExpenseQuery(params: { id: string | undefined }) {
  return useQuery<Expense>(
    generatePath('/api/v1/expenses/:id', { id: params.id }),
    () =>
      request('GET', endpoint('/api/v1/expenses/:id', { id: params.id })).then(
        (response) => response.data.data
      ),
    { staleTime: Infinity }
  );
}
