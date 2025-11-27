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
import { ClientSelector } from '$app/pages/invoices/common/components/ClientSelector';
import { InvoicePreview } from '$app/pages/invoices/common/components/InvoicePreview';
import { InvoiceTotals } from '$app/pages/invoices/common/components/InvoiceTotals';
import { ProductsTable } from '$app/pages/invoices/common/components/ProductsTable';
import { useProductColumns } from '$app/pages/invoices/common/hooks/useProductColumns';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { QuoteDetails } from '../common/components/QuoteDetails';
import { QuoteFooter } from '../common/components/QuoteFooter';
import { useQuoteUtilities } from '../common/hooks';
import { Card } from '$app/components/cards';
import { QuoteStatus as QuoteStatusBadge } from '../common/components/QuoteStatus';
import { TabGroup } from '$app/components/TabGroup';
import { useTaskColumns } from '$app/pages/invoices/common/hooks/useTaskColumns';
import { useColorScheme } from '$app/common/colors';
import { QuoteContext } from '../create/Create';
import { TasksTabLabel } from '$app/pages/invoices/common/components/TasksTabLabel';
import { useProductQuoteColumns } from '$app/pages/invoices/common/hooks/useProductQuoteColumns';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';

export default function Edit() {
  const [t] = useTranslation();

  const [searchParams] = useSearchParams();

  const company = useCurrentCompany();
  const reactSettings = useReactSettings();

  const context: QuoteContext = useOutletContext();
  const {
    quote,
    errors,
    isDefaultTerms,
    isDefaultFooter,
    client,
    setIsDefaultFooter,
    setIsDefaultTerms,
    invoiceSum,
  } = context;

  const colors = useColorScheme();
  const taskColumns = useTaskColumns();
  const productColumns = useProductColumns();
  const productQuoteColumns = useProductQuoteColumns();

  const {
    handleChange,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
  } = useQuoteUtilities({ client });

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <Card
          className="col-span-12 xl:col-span-4 h-max px-6 py-2 shadow-sm"
          style={{ borderColor: colors.$24 }}
        >
          <div className="flex flex-col space-y-4">
            {quote && (
              <div className="flex items-center space-x-9">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$22 }}
                >
                  {t('status')}
                </span>

                <div>
                  <QuoteStatusBadge entity={quote} />
                </div>
              </div>
            )}

            <ClientSelector
              resource={quote}
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

        <QuoteDetails handleChange={handleChange} errors={errors} />

        <div className="col-span-12">
          <TabGroup
            tabs={[t('products'), t('tasks')]}
            defaultTabIndex={searchParams.get('table') === 'tasks' ? 1 : 0}
            formatTabLabel={(index) => {
              if (index === 1) {
                return <TasksTabLabel lineItems={quote?.line_items || []} />;
              }
            }}
          >
            <div>
              {quote && client ? (
                <ProductsTable
                  type="product"
                  resource={quote}
                  items={quote.line_items.filter(
                    (item) => item.type_id === InvoiceItemType.Product
                  )}
                  columns={
                    company?.settings.sync_invoice_quote_columns
                      ? productColumns
                      : productQuoteColumns
                  }
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
              {quote && client ? (
                <ProductsTable
                  type="task"
                  resource={quote}
                  items={quote.line_items.filter(
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

        <QuoteFooter
          handleChange={handleChange}
          errors={errors}
          isDefaultFooter={isDefaultFooter}
          isDefaultTerms={isDefaultTerms}
          setIsDefaultFooter={setIsDefaultFooter}
          setIsDefaultTerms={setIsDefaultTerms}
        />

        {quote && (
          <InvoiceTotals
            relationType="client_id"
            resource={quote}
            invoiceSum={invoiceSum}
            onChange={(property, value) =>
              handleChange(property, value as string)
            }
          />
        )}
      </div>

      {reactSettings?.show_pdf_preview && (
        <div className="my-4">
          {quote && (
            <InvoicePreview
              for="invoice"
              resource={quote}
              entity="quote"
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
