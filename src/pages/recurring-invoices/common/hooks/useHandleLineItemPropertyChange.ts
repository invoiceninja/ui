/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceItem } from 'common/interfaces/invoice-item';
import { setCurrentLineItemProperty } from 'common/stores/slices/recurring-invoices/extra-reducers/set-current-line-item-property';
import { useDispatch } from 'react-redux';

export function useHandleLineItemPropertyChange() {
  const dispatch = useDispatch();

  return (key: keyof InvoiceItem, value: unknown, index: number) => {
    dispatch(
      setCurrentLineItemProperty({
        position: index,
        property: key,
        value,
      })
    );
  };
}
