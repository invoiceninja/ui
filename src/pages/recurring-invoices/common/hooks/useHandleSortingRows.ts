/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { arrayMoveImmutable } from 'array-move';
import { DropResult } from 'react-beautiful-dnd';
import { useCurrentRecurringInvoice } from './useCurrentRecurringInvoice';
import { useSetCurrentRecurringInvoiceProperty } from './useSetCurrentRecurringInvoiceProperty';

export function useHandleSortingRows() {
  const invoice = useCurrentRecurringInvoice();
  const handleChange = useSetCurrentRecurringInvoiceProperty();

  return (result: DropResult) => {
    const sorted = invoice
      ? arrayMoveImmutable(
          invoice.line_items,
          result.source.index,
          result.destination?.index as unknown as number
        )
      : [];

    handleChange('line_items', sorted);
  };
}
