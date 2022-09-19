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
import { Invoice } from 'common/interfaces/invoice';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useQueryClient } from 'react-query';
import { generatePath } from 'react-router-dom';

export function useMarkPaid() {
  const queryClient = useQueryClient();

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
          generatePath('/api/v1/invoices/:id', { id: invoice.id })
        );
      })
      .catch((error) => {
        toast.error();

        console.error(error);
      });
  };
}
