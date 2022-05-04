/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceItem } from 'common/interfaces/invoice-item';
import { setCurrentLineItemProperty } from 'common/stores/slices/invoices/extra-reducers/set-current-line-item-property';
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
