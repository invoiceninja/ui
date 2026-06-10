/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { productCreateModalAtom } from '$app/common/atoms/product-create';
import { Invoice } from '$app/common/interfaces/invoice';
import { InvoiceItem, InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { Spinner } from '$app/components/Spinner';
import { TabGroup } from '$app/components/TabGroup';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProductColumns } from '../../hooks/useProductColumns';
import { useTaskColumns } from '../../hooks/useTaskColumns';
import { ProductsTable } from '../ProductsTable';
import { TasksTabLabel } from '../TasksTabLabel';

const FIRST_PRODUCT_PROMPT_KEY = 'invoice-editor.product-create-prompted';

interface Props {
  invoice?: Invoice;
  onLineItemChange: (index: number, lineItem: InvoiceItem) => unknown;
  onLineItemPropertyChange: (
    key: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => unknown;
  onCreateLineItem: (type: InvoiceItemType) => unknown;
  onDeleteLineItem: (index: number) => unknown;
  onSort: (lineItems: InvoiceItem[]) => unknown;
}

export function SimplifiedItemsSection({
  invoice,
  onLineItemChange,
  onLineItemPropertyChange,
  onCreateLineItem,
  onDeleteLineItem,
  onSort,
}: Props) {
  const [t] = useTranslation();
  const [searchParams] = useSearchParams();

  const productColumns = useProductColumns();
  const taskColumns = useTaskColumns();

  const openProductCreateModal = useSetAtom(productCreateModalAtom);

  // First time the user ever clicks "Add item" we surface the ProductCreate modal
  // so they understand they have a product catalog — but still add the line item
  // underneath so the click isn't a no-op. We persist a flag in localStorage so
  // this only happens once per browser, even across new invoices.
  const handleAddProductClick = () => {
    try {
      const prompted = window.localStorage.getItem(FIRST_PRODUCT_PROMPT_KEY);
      if (!prompted) {
        window.localStorage.setItem(FIRST_PRODUCT_PROMPT_KEY, '1');
        openProductCreateModal(true);
      }
    } catch {
      // localStorage unavailable (private mode, quota) — fall through to default add.
    }

    onCreateLineItem(InvoiceItemType.Product);
  };

  return (
    <TabGroup
      tabs={[t('products'), t('tasks')]}
      defaultTabIndex={searchParams.get('table') === 'tasks' ? 1 : 0}
      formatTabLabel={(index) => {
        if (index === 1) {
          return <TasksTabLabel lineItems={invoice?.line_items || []} />;
        }
      }}
    >
      <div>
        {invoice ? (
          <ProductsTable
            type="product"
            resource={invoice}
            shouldCreateInitialLineItem={searchParams.get('table') !== 'tasks'}
            items={invoice.line_items.filter((item) =>
              [
                InvoiceItemType.Product,
                InvoiceItemType.UnpaidFee,
                InvoiceItemType.PaidFee,
                InvoiceItemType.LateFee,
              ].includes(item.type_id)
            )}
            columns={productColumns}
            relationType="client_id"
            onLineItemChange={onLineItemChange}
            onSort={onSort}
            onLineItemPropertyChange={onLineItemPropertyChange}
            onCreateItemClick={handleAddProductClick}
            onDeleteRowClick={onDeleteLineItem}
          />
        ) : (
          <Spinner />
        )}
      </div>

      <div>
        {invoice ? (
          <ProductsTable
            type="task"
            resource={invoice}
            shouldCreateInitialLineItem={searchParams.get('table') === 'tasks'}
            items={invoice.line_items.filter(
              (item) => item.type_id === InvoiceItemType.Task
            )}
            columns={taskColumns}
            relationType="client_id"
            onLineItemChange={onLineItemChange}
            onSort={onSort}
            onLineItemPropertyChange={onLineItemPropertyChange}
            onCreateItemClick={() => onCreateLineItem(InvoiceItemType.Task)}
            onDeleteRowClick={onDeleteLineItem}
          />
        ) : (
          <Spinner />
        )}
      </div>
    </TabGroup>
  );
}
