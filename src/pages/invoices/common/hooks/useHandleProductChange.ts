/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { setCurrentLineItemProperty } from 'common/stores/slices/invoices';
import { Record } from 'components/forms/DebouncedCombobox';
import { useDispatch } from 'react-redux';

export function useHandleProductChange() {
  const dispatch = useDispatch();

  return (index: number, value: Record) => {
    dispatch(
      setCurrentLineItemProperty({
        position: index,
        property: 'product_key',
        value: value.label,
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
