/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { Invoice } from '$app/common/interfaces/invoice';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';

export function useMarkPaid() {
  const queryClient = useQueryClient();

  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (invoice: Invoice) => {
    toast.processing();

    request(
      'PUT',
      endpoint('/api/v1/invoices/:id?paid=true', { id: invoice.id }),
      invoice
    )
      .then(() => {
        toast.success('invoice_paid');

        queryClient.invalidateQueries('/api/v1/invoices');

        queryClient.invalidateQueries(
          route('/api/v1/invoices/:id', { id: invoice.id })
        );

        invalidateQueryValue &&
          queryClient.invalidateQueries([invalidateQueryValue]);
      })
      .catch((error) => {
        toast.error();

        console.error(error);
      });
  };
}
