/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { toast } from '$app/common/helpers/toast/toast';
import { Invoice } from '$app/common/interfaces/invoice';
import { bulk } from '$app/common/queries/invoices';
import { useNavigate } from 'react-router-dom';

export function useHandleDelete() {
  const navigate = useNavigate();

  return (invoice: Invoice) => {
    toast.processing();

    bulk([invoice.id], 'delete').then(() => {
      toast.success('deleted_invoice');

      navigate('/invoices');
    });
  };
}
