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
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { defaultHeaders } from 'common/queries/common/headers';
import { setCurrentRecurringInvoice } from 'common/stores/slices/recurring-invoices/extra-reducers/set-current-recurring-invoice';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { generatePath } from 'react-router-dom';

export function useRecurringInvoiceSave() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return (id: string, recurringInvoice: RecurringInvoice) => {
    const toastId = toast.loading(t('processing'));

    axios
      .put(
        endpoint('/api/v1/recurring_invoices/:id', { id }),
        recurringInvoice,
        {
          headers: defaultHeaders(),
        }
      )
      .then((response) => {
        toast.success(t('updated_recurring_invoice'), { id: toastId });
        dispatch(setCurrentRecurringInvoice(response.data.data));
      })
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      })
      .finally(() =>
        queryClient.invalidateQueries(
          generatePath('/api/v1/recurring_invoices/:id', { id })
        )
      );
  };
}
