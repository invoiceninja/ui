/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { Invoice } from '$app/common/interfaces/invoice';
import { InvoiceItem, InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { Spinner } from '$app/components/Spinner';
import { TabGroup } from '$app/components/TabGroup';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProductColumns } from '../../hooks/useProductColumns';
import { useTaskColumns } from '../../hooks/useTaskColumns';
import { ProductsTable } from '../ProductsTable';
import { TasksTabLabel } from '../TasksTabLabel';

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
  const colors = useColorScheme();

  const productColumns = useProductColumns();
  const taskColumns = useTaskColumns();

  return (
    <div
      className="border rounded-md overflow-hidden"
      style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
    >
      <div className="px-6 py-4 border-b" style={{ borderColor: colors.$24 }}>
        <span className="text-sm font-semibold" style={{ color: colors.$3 }}>
          {t('items')}
        </span>
      </div>

      <div className="p-2">
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
                shouldCreateInitialLineItem={
                  searchParams.get('table') !== 'tasks'
                }
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
                onCreateItemClick={() =>
                  onCreateLineItem(InvoiceItemType.Product)
                }
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
                shouldCreateInitialLineItem={
                  searchParams.get('table') === 'tasks'
                }
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
      </div>
    </div>
  );
}
