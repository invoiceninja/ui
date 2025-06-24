/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { Spinner } from '$app/components/Spinner';
import { ClientSelector } from '$app/pages/invoices/common/components/ClientSelector';
import { InvoicePreview } from '$app/pages/invoices/common/components/InvoicePreview';
import { InvoiceTotals } from '$app/pages/invoices/common/components/InvoiceTotals';
import { ProductsTable } from '$app/pages/invoices/common/components/ProductsTable';
import { Card } from '$app/components/cards';
import { TabGroup } from '$app/components/TabGroup';
import { InvoiceDetails } from '../../common/components/InvoiceDetails';
import { useTranslation } from 'react-i18next';
import { InvoiceFooter } from '../../common/components/InvoiceFooter';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { RecurringInvoiceContext } from '../Create';
import { useRecurringInvoiceUtilities } from '../../common/hooks';
import { useProductColumns } from '$app/pages/invoices/common/hooks/useProductColumns';
import { useTaskColumns } from '$app/pages/invoices/common/hooks/useTaskColumns';

export default function CreatePage() {
  const [t] = useTranslation();

  const [searchParams] = useSearchParams();

  const context: RecurringInvoiceContext = useOutletContext();

  const { recurringInvoice, errors, invoiceSum, client } = context;

  const taskColumns = useTaskColumns();
  const productColumns = useProductColumns();

  const {
    handleChange,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
  } = useRecurringInvoiceUtilities({
    client,
  });

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
          <ClientSelector
            resource={recurringInvoice}
            onChange={(id) => handleChange('client_id', id)}
            onLocationChange={(id) => handleChange('location_id', id)}
            onClearButtonClick={() => {
              handleChange('client_id', '');
              handleChange('location_id', '');
            }}
            onContactCheckboxChange={handleInvitationChange}
            errorMessage={errors?.errors.client_id}
            disableWithSpinner={searchParams.get('action') === 'create'}
          />
        </Card>

        <InvoiceDetails handleChange={handleChange} errors={errors} />

        <div className="col-span-12">
          <TabGroup
            tabs={[t('products'), t('tasks')]}
            defaultTabIndex={searchParams.get('table') === 'tasks' ? 1 : 0}
          >
            <div>
              {recurringInvoice ? (
                <ProductsTable
                  type="product"
                  resource={recurringInvoice}
                  items={recurringInvoice.line_items.filter((item) =>
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
                  onCreateItemClick={() =>
                    handleCreateLineItem(InvoiceItemType.Product)
                  }
                  onDeleteRowClick={handleDeleteLineItem}
                />
              ) : (
                <Spinner />
              )}
            </div>

            <div>
              {recurringInvoice ? (
                <ProductsTable
                  type="task"
                  resource={recurringInvoice}
                  items={recurringInvoice.line_items.filter(
                    (item) => item.type_id === InvoiceItemType.Task
                  )}
                  columns={taskColumns}
                  relationType="client_id"
                  onLineItemChange={handleLineItemChange}
                  onSort={(lineItems) => handleChange('line_items', lineItems)}
                  onLineItemPropertyChange={handleLineItemPropertyChange}
                  onCreateItemClick={() =>
                    handleCreateLineItem(InvoiceItemType.Task)
                  }
                  onDeleteRowClick={handleDeleteLineItem}
                />
              ) : (
                <Spinner />
              )}
            </div>
          </TabGroup>
        </div>

        <InvoiceFooter handleChange={handleChange} errors={errors} />

        {recurringInvoice && (
          <InvoiceTotals
            relationType="client_id"
            resource={recurringInvoice}
            invoiceSum={invoiceSum}
            onChange={(property, value) =>
              handleChange(property, value as string)
            }
          />
        )}
      </div>

      <div className="my-4">
        {recurringInvoice && (
          <InvoicePreview
            for="create"
            resource={recurringInvoice}
            entity="recurring_invoice"
            relationType="client_id"
            endpoint="/api/v1/live_preview?entity=:entity"
            observable={true}
            initiallyVisible={false}
          />
        )}
      </div>
    </>
  );
}
