/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Invoice } from '$app/common/interfaces/invoice';
import { bulk } from '$app/common/queries/invoices';
import { useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';

export function useHandleRestore() {
  const queryClient = useQueryClient();

  return (invoice: Invoice) => {
    toast.processing();

    bulk([invoice.id], 'restore')
      .then(() => toast.success('restored_invoice'))
      .finally(() =>
        queryClient.invalidateQueries(
          route('/api/v1/invoices/:id', { id: invoice.id })
        )
      );
  };
}
