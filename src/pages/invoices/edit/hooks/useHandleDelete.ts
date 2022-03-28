/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Invoice } from 'common/interfaces/invoice';
import { bulk } from 'common/queries/invoices';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function useHandleDelete() {
  const [t] = useTranslation();
  const navigate = useNavigate();

  return (invoice: Invoice) => {
    const toastId = toast.loading(t('processing'));

    bulk([invoice.id], 'delete')
      .then(() => {
        toast.success(t('deleted_invoice'), { id: toastId });

        navigate('/invoices');
      })
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      });
  };
}
