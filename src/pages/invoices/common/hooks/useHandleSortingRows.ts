/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { arrayMoveImmutable } from 'array-move';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { DropResult } from 'react-beautiful-dnd';
import { useSetCurrentInvoiceProperty } from './useSetCurrentInvoiceProperty';

export function useHandleSortingRows() {
  const invoice = useCurrentInvoice();
  const handleChange = useSetCurrentInvoiceProperty();

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
