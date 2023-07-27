/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { toast } from '$app/common/helpers/toast/toast';
import { Invoice } from '$app/common/interfaces/invoice';
import { bulk } from '$app/common/queries/invoices';
import { useAtomValue } from 'jotai';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export function useHandleCancel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (invoice: Invoice) => {
    toast.processing();

    bulk([invoice.id], 'cancel').then(() => {
      toast.success('cancelled_invoice');

      invalidateQueryValue &&
        queryClient.invalidateQueries([invalidateQueryValue]);

      navigate('/invoices');
    });
  };
}
