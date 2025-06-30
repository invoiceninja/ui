/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { Spinner } from '$app/components/Spinner';
import { useAtomValue } from 'jotai';
import { ClientSelector } from '$app/pages/invoices/common/components/ClientSelector';
import { InvoicePreview } from '$app/pages/invoices/common/components/InvoicePreview';
import { InvoiceTotals } from '$app/pages/invoices/common/components/InvoiceTotals';
import { ProductsTable } from '$app/pages/invoices/common/components/ProductsTable';
import { useProductColumns } from '$app/pages/invoices/common/hooks/useProductColumns';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { invoiceSumAtom } from '../common/atoms';
import { InvoiceDetails } from '../common/components/InvoiceDetails';
import { InvoiceFooter } from '../common/components/InvoiceFooter';
import { useRecurringInvoiceUtilities } from '../common/hooks';
import { Card } from '$app/components/cards';
import { RecurringInvoiceStatus as RecurringInvoiceStatusBadge } from '../common/components/RecurringInvoiceStatus';
import { TabGroup } from '$app/components/TabGroup';
import { useTaskColumns } from '$app/pages/invoices/common/hooks/useTaskColumns';
import { useColorScheme } from '$app/common/colors';
import { RecurringInvoiceContext } from '../create/Create';

export default function Edit() {
  const [t] = useTranslation();

  const [searchParams] = useSearchParams();

  const colors = useColorScheme();
  const taskColumns = useTaskColumns();
  const reactSettings = useReactSettings();
  const productColumns = useProductColumns();

  const context: RecurringInvoiceContext = useOutletContext();

  const { recurringInvoice, errors, client } = context;

  const invoiceSum = useAtomValue(invoiceSumAtom);

  const {
    handleChange,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
  } = useRecurringInvoiceUtilities({ client });

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <Card
          className="col-span-12 xl:col-span-4 h-max px-6 py-2 shadow-sm"
          style={{ borderColor: colors.$24 }}
        >
          <div className="flex flex-col space-y-4">
            {recurringInvoice && (
              <div className="flex items-center space-x-9">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$22 }}
                >
                  {t('status')}
                </span>

                <div>
                  <RecurringInvoiceStatusBadge entity={recurringInvoice} />
                </div>
              </div>
            )}

            <ClientSelector
              resource={recurringInvoice}
              onChange={(id) => handleChange('client_id', id)}
              onClearButtonClick={() => handleChange('client_id', '')}
              onLocationChange={(locationId) =>
                handleChange('location_id', locationId)
              }
              onContactCheckboxChange={handleInvitationChange}
              errorMessage={errors?.errors.client_id}
              textOnly
              readonly
            />
          </div>
        </Card>

        <InvoiceDetails handleChange={handleChange} errors={errors} />

        <div className="col-span-12">
          <TabGroup
            tabs={[t('products'), t('tasks')]}
            defaultTabIndex={searchParams.get('table') === 'tasks' ? 1 : 0}
          >
            <div>
              {recurringInvoice && client ? (
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
              {recurringInvoice && client ? (
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

      {reactSettings?.show_pdf_preview && (
        <div className="my-4">
          {recurringInvoice && (
            <InvoicePreview
              for="invoice"
              resource={recurringInvoice}
              entity="recurring_invoice"
              relationType="client_id"
              endpoint="/api/v1/live_preview?entity=:entity"
              withRemoveLogoCTA
              observable={true}
              initiallyVisible={false}
            />
          )}
        </div>
      )}
    </>
  );
}
