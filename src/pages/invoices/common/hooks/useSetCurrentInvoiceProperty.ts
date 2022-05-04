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
import { setCurrentInvoiceProperty } from 'common/stores/slices/invoices/extra-reducers/set-current-invoice-property';
import { useDispatch } from 'react-redux';

export function useSetCurrentInvoiceProperty() {
  const dispatch = useDispatch();

  return (property: keyof Invoice, value: unknown) => {
    dispatch(setCurrentInvoiceProperty({ property, value }));
  };
}
