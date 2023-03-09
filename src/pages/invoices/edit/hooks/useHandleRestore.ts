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
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';

export function useHandleRestore() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  return (invoice: Invoice) => {
    const toastId = toast.loading(t('processing'));

    bulk([invoice.id], 'restore')
      .then(() => {
        toast.success(t('restored_invoice'), { id: toastId });
      })
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      })
      .finally(() =>
        queryClient.invalidateQueries(
          route('/api/v1/invoices/:id', { id: invoice.id })
        )
      );
  };
}
