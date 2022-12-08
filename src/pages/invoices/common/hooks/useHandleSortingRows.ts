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
import { InvoiceItem } from 'common/interfaces/invoice-item';
import { DropResult } from '@hello-pangea/dnd';
import { ProductTableResource } from '../components/ProductsTable';

interface Props {
  resource: ProductTableResource;
  onSort: (lineItems: InvoiceItem[]) => unknown;
}

export function useHandleSortingRows(props: Props) {
  const resource = props.resource;

  return (result: DropResult) => {
    const sorted = resource
      ? arrayMoveImmutable(
          resource.line_items,
          result.source.index,
          result.destination?.index as unknown as number
        )
      : [];

    return props.onSort(sorted);
  };
}
