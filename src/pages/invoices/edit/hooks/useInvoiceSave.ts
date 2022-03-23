/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { endpoint } from 'common/helpers';
import { Invoice } from 'common/interfaces/invoice';
import { defaultHeaders } from 'common/queries/common/headers';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useInvoiceSave() {
  const [t] = useTranslation();

  return (id: string, invoice: Invoice) => {
    const toastId = toast.loading(t('processing'));

    axios
      .put(endpoint('/api/v1/invoices/:id', { id }), invoice, {
        headers: defaultHeaders,
      })
      .then(() => toast.success(t('updated_invoice'), { id: toastId }))
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      });
  };
}
