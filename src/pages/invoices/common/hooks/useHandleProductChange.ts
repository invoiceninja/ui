/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { setCurrentLineItemProperty } from 'common/stores/slices/invoices/extra-reducers/set-current-line-item-property';
import { Record } from 'components/forms/DebouncedCombobox';
import { useDispatch } from 'react-redux';

export function useHandleProductChange() {
  const dispatch = useDispatch();
  const invoice = useCurrentInvoice();

  return (index: number, value: Record) => {
    dispatch(
      setCurrentLineItemProperty({
        position: index,
        property: 'product_key',
        value: value.label,
      })
    );

    if (invoice && invoice.line_items[index].quantity < 1)
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
    console.log(value);
    dispatch(
      setCurrentLineItemProperty({
        position: index,
        property: 'tax_rate1',
        value: value.resource?.tax_rate1 || 0,
      })
    );
    dispatch(
      setCurrentLineItemProperty({
        position: index,
        property: 'tax_name1',
        value: value.resource?.tax_name1 || '',
      })
    );
    dispatch(
      setCurrentLineItemProperty({
        position: index,
        property: 'tax_rate2',
        value: value.resource?.tax_rate2 || 0,
      })
    );
    dispatch(
      setCurrentLineItemProperty({
        position: index,
        property: 'tax_name2',
        value: value.resource?.tax_name2 || '',
      })
    );
    dispatch(
      setCurrentLineItemProperty({
        position: index,
        property: 'tax_rate3',
        value: value.resource?.tax_rate3 || 0,
      })
    );
    dispatch(
      setCurrentLineItemProperty({
        position: index,
        property: 'tax_name3',
        value: value.resource?.tax_name3 || '',
      })
    );

    dispatch(
      setCurrentLineItemProperty({
        position: index,
        property: 'notes',
        value: value.resource?.notes || '',
      })
    );
  };
}
