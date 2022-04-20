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
import { useDispatch } from 'react-redux';

export function useToggleStartStop() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  return (recurringInvoice: RecurringInvoice, status: boolean) => {
    const toastId = toast.loading(t('processing'));

    axios
      .put(
        endpoint('/api/v1/recurring_invoices/:id?stop=:status', {
          id: recurringInvoice.id,
          status,
        }),
        recurringInvoice,
        { headers: defaultHeaders() }
      )
      .then((response) => {
        dispatch(setCurrentRecurringInvoice(response.data.data));

        toast.success(
          status
            ? t('started_recurring_invoice')
            : t('stopped_recurring_invoice'),
          { id: toastId }
        );
      })
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      });
  };
}
