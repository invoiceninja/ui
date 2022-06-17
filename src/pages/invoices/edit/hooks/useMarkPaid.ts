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
import { setCurrentInvoice } from 'common/stores/slices/invoices/extra-reducers/set-current-invoice';
import { request } from 'common/helpers/request';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export function useMarkPaid() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  return (invoice: Invoice) => {
    const toastId = toast.loading(t('processing'));

    request(
      'PUT',
      endpoint('/api/v1/invoices/:id?paid=true', { id: invoice.id }),
      invoice
    )
      .then((response) => {
        toast.success(t('paid'), { id: toastId });

        dispatch(setCurrentInvoice(response.data.data));
      })
      .catch((error) => {
        toast.error(t('error_title'), { id: toastId });

        console.error(error);
      });
  };
}