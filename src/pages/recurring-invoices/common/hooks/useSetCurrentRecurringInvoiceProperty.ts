/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { setCurrentRecurringInvoiceProperty } from 'common/stores/slices/recurring-invoices/extra-reducers/set-current-recurring-invoice-property';
import { useDispatch } from 'react-redux';

export function useSetCurrentRecurringInvoiceProperty() {
  const dispatch = useDispatch();

  return (property: keyof RecurringInvoice, value: unknown) => {
    dispatch(setCurrentRecurringInvoiceProperty({ property, value }));
  };
}
