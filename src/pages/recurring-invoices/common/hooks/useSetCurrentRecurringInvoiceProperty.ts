/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
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
