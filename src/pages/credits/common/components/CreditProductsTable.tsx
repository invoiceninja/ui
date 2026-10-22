/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtomValue } from 'jotai';
import { Client } from '$app/common/interfaces/client';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { ProductsTable } from '$app/pages/invoices/common/components/ProductsTable';
import { useProductColumns } from '$app/pages/invoices/common/hooks/useProductColumns';
import { creditAtom } from '../atoms';
import { useCreditUtilities } from '../hooks';

interface Props {
  client: Client | undefined;
}

export function CreditProductsTable(props: Props) {
  const credit = useAtomValue(creditAtom);
  const productColumns = useProductColumns();

  const {
    handleChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
  } = useCreditUtilities({ client: props.client });

  if (!credit) {
    return null;
  }

  return (
    <ProductsTable
      type="product"
      resource={credit}
      items={credit.line_items.filter((item) =>
        [
          InvoiceItemType.Product,
          InvoiceItemType.UnpaidFee,
          InvoiceItemType.PaidFee,
          InvoiceItemType.LateFee,
        ].includes(item.type_id)
      )}
      columns={productColumns}
      relationType="client_id"
      onLineItemChange={handleLineItemChange}
      onSort={(lineItems) => handleChange('line_items', lineItems)}
      onLineItemPropertyChange={handleLineItemPropertyChange}
      onCreateItemClick={handleCreateLineItem}
      onDeleteRowClick={handleDeleteLineItem}
    />
  );
}
