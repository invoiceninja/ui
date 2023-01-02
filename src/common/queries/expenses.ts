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
import { route } from 'common/helpers/route';

interface BlankQueryParams {
  enabled?: boolean;
}

export function useBlankExpenseQuery(params: BlankQueryParams) {
  return useQuery<Expense>(
    route('/api/v1/expenses/create'),
    () =>
      request('GET', endpoint('/api/v1/expenses/create')).then(
        (response) => response.data.data
      ),
    { enabled: params.enabled ?? true, staleTime: Infinity }
  );
}

interface Params {
  id: string | undefined;
  enabled?: boolean;
}

export function useExpenseQuery(params: Params) {
  return useQuery<Expense>(
    route('/api/v1/expenses/:id', { id: params.id }),
    () =>
      request('GET', endpoint('/api/v1/expenses/:id', { id: params.id })).then(
        (response) => response.data.data
      ),
    { enabled: params.enabled ?? true, staleTime: Infinity }
  );
}
