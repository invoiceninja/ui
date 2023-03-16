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
import { Invoice } from '$app/common/interfaces/invoice';
import { bulk } from '$app/common/queries/invoices';
import { useAtomValue } from 'jotai';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export function useHandleCancel() {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (invoice: Invoice) => {
    const toastId = toast.loading(t('processing'));

    bulk([invoice.id], 'cancel')
      .then(() => {
        toast.success(t('cancelled_invoice'), { id: toastId });

        invalidateQueryValue &&
          queryClient.invalidateQueries([invalidateQueryValue]);

        navigate('/invoices');
      })
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      });
  };
}
