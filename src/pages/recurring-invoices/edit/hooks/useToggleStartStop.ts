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
import { request } from 'common/helpers/request';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { setCurrentRecurringInvoice } from 'common/stores/slices/recurring-invoices/extra-reducers/set-current-recurring-invoice';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export function useToggleStartStop() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  return (recurringInvoice: RecurringInvoice, action: 'start' | 'stop') => {
    const toastId = toast.loading(t('processing'));

    const url =
      action === 'start'
        ? '/api/v1/recurring_invoices/:id?start=true'
        : '/api/v1/recurring_invoices/:id?stop=true';

    request('PUT', endpoint(url, { id: recurringInvoice.id }), recurringInvoice)
      .then((response) => {
        dispatch(setCurrentRecurringInvoice(response.data.data));

        toast.success(
          action === 'start'
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
