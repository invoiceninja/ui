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
import { RecurringExpense } from 'common/interfaces/recurring-expense';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';

export function useBlankRecurringExpenseQuery() {
  return useQuery<RecurringExpense>(
    route('/api/v1/recurring_expenses/create'),
    () =>
      request('GET', endpoint('/api/v1/recurring_expenses/create')).then(
        (response: GenericSingleResourceResponse<RecurringExpense>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}
