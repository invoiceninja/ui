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

export function useBlankExpenseQuery() {
  return useQuery<Expense>(
    route('/api/v1/expenses/create'),
    () =>
      request('GET', endpoint('/api/v1/expenses/create')).then(
        (response) => response.data.data
      ),
    { staleTime: Infinity }
  );
}

interface Props {
  id: string | undefined;
  enabled?: boolean;
}

export function useExpenseQuery(props: Props) {
  return useQuery<Expense>(
    route('/api/v1/expenses/:id', { id: props.id }),
    () =>
      request('GET', endpoint('/api/v1/expenses/:id', { id: props.id })).then(
        (response) => response.data.data
      ),
    { enabled: props.enabled ?? true, staleTime: Infinity }
  );
}
