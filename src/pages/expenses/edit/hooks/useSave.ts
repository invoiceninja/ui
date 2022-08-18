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
import { toast } from 'common/helpers/toast/toast';
import { Expense } from 'common/interfaces/expense';
import { useQueryClient } from 'react-query';
import { generatePath } from 'react-router-dom';

export function useSave() {
  const queryClient = useQueryClient();

  return (expense: Expense) => {
    toast.processing();

    request(
      'PUT',
      endpoint('/api/v1/expenses/:id', { id: expense.id }),
      expense
    )
      .then(() => toast.success('updated_expense'))
      .catch((error) => {
        console.error(error);
        toast.error();
      })
      .finally(() =>
        queryClient.invalidateQueries(
          generatePath('/api/v1/expenses/:id', { id: expense.id })
        )
      );
  };
}
