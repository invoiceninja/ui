/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { setCurrentLineItemProperty } from 'common/stores/slices/recurring-invoices/extra-reducers/set-current-line-item-property';
import { Record } from 'components/forms/DebouncedCombobox';
import { useDispatch } from 'react-redux';
import { useCurrentRecurringInvoice } from './useCurrentRecurringInvoice';

export function useHandleProductChange() {
  const dispatch = useDispatch();
  const invoice = useCurrentRecurringInvoice();
  return (index: number, value: Record) => {
    dispatch(
      setCurrentLineItemProperty({
        position: index,
        property: 'product_key',
        value: value.label,
      })
    );

    if (!value.internal && invoice && invoice.line_items[index].quantity < 1)
      dispatch(
        setCurrentLineItemProperty({
          position: index,
          property: 'quantity',
          value: 1,
        })
      );
    if (!value.internal && value.resource) {
      dispatch(
        setCurrentLineItemProperty({
          position: index,
          property: 'cost',
          value: value.resource?.cost || 0,
        })
      );
    }

    dispatch(
      setCurrentLineItemProperty({
        position: index,
        property: 'notes',
        value: value.resource?.notes || '',
      })
    );
  };
}
