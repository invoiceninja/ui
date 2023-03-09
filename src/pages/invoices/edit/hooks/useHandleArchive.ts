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
import { useNavigate } from 'react-router-dom';

export function useHandleArchive() {
  const [t] = useTranslation();
  const navigate = useNavigate();

  return (invoice: Invoice) => {
    const toastId = toast.loading(t('processing'));

    bulk([invoice.id], 'archive')
      .then(() => {
        toast.success(t('archived_invoice'), { id: toastId });

        navigate('/invoices');
      })
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      });
  };
}
