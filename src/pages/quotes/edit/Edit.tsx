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
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { QuoteDetails } from '../common/components/QuoteDetails';
import { QuoteFooter } from '../common/components/QuoteFooter';
import { useQuoteUtilities } from '../common/hooks';
import { Card } from '$app/components/cards';
import { QuoteStatus as QuoteStatusBadge } from '../common/components/QuoteStatus';
import { TabGroup } from '$app/components/TabGroup';
import { useTaskColumns } from '$app/pages/invoices/common/hooks/useTaskColumns';
import { useColorScheme } from '$app/common/colors';
import { QuoteContext } from '../create/Create';
import { Badge } from '$app/components/Badge';
import { useStatusThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';

export default function Edit() {
  const [t] = useTranslation();

  const [searchParams] = useSearchParams();

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
  const statusThemeColors = useStatusThemeColorScheme();
  const {
    handleChange,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
    handleContactCanSignChange,
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

                <div className="flex items-center space-x-2">
                  <QuoteStatusBadge entity={quote} />


                  {quote && quote.sync?.dn_completed && quote.sync?.invitations[0]?.dn_id && (
                    <Badge variant="green" style={{ backgroundColor: statusThemeColors.$3 }}>
                    <Link
                      className="font-medium"
                      to={`/documents/${quote.sync?.invitations[0]?.dn_id}`}
                      >
                      {t('signed_document')}
                    </Link>
                  </Badge>
            )}
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
              onContactCanSignCheckboxChange={handleContactCanSignChange}
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
          >
            <div>
              {quote && client ? (
                <ProductsTable
                  type="product"
                  resource={quote}
                  items={quote.line_items.filter(
                    (item) => item.type_id === InvoiceItemType.Product
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
