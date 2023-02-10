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
import { Invoice } from 'common/interfaces/invoice';
import { useQueryClient } from 'react-query';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from 'common/atoms/data-table';

export function useMarkSent() {
  const queryClient = useQueryClient();

  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (invoice: Invoice) => {
    toast.processing();

    request(
      'PUT',
      endpoint('/api/v1/invoices/:id?mark_sent=true', { id: invoice.id }),
      invoice
    )
      .then(() => {
        toast.success('marked_invoice_as_sent');

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
