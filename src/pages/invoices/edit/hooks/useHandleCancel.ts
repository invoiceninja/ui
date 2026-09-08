/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { toast } from '$app/common/helpers/toast/toast';
import { Invoice } from '$app/common/interfaces/invoice';
import { bulk } from '$app/common/queries/invoices';

export function useHandleCancel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (invoice: Invoice) => {
    toast.processing();

    bulk([invoice.id], 'cancel').then(() => {
      toast.success('cancelled_invoice');

      invalidateQueryValue &&
        queryClient.invalidateQueries({
          queryKey: [invalidateQueryValue],
        });

      navigate('/invoices');
    });
  };
}
