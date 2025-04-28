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
import { Invoice } from '$app/common/interfaces/invoice';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { Spinner } from '$app/components/Spinner';
import { TabGroup } from '$app/components/TabGroup';
import { useTranslation } from 'react-i18next';
import { Card } from '$app/components/cards';
import { ClientSelector } from '../../common/components/ClientSelector';
import { InvoiceDetails } from '../../common/components/InvoiceDetails';
import { ProductsTable } from '../../common/components/ProductsTable';
import { useProductColumns } from '../../common/hooks/useProductColumns';
import { useTaskColumns } from '../../common/hooks/useTaskColumns';
import { useInvoiceUtilities } from '../hooks/useInvoiceUtilities';
import { InvoiceFooter } from '../../common/components/InvoiceFooter';
import { InvoiceTotals } from '../../common/components/InvoiceTotals';
import { InvoicePreview } from '../../common/components/InvoicePreview';
import { CreateInvoiceContext } from '../Create';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';

export type ChangeHandler = <T extends keyof Invoice>(
  property: T,
  value: Invoice[typeof property]
) => void;

export default function CreatePage() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const [searchParams] = useSearchParams();

  const context: CreateInvoiceContext = useOutletContext();
  const {
    invoice,
    errors,
    client,
    invoiceSum,
    isDefaultFooter,
    isDefaultTerms,
    setIsDefaultFooter,
    setIsDefaultTerms,
  } = context;

  const taskColumns = useTaskColumns();
  const reactSettings = useReactSettings();
  const productColumns = useProductColumns();

  const {
    handleChange,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
  } = useInvoiceUtilities({ client });

  const resetInvoiceForm = () => {
    handleChange('client_id', '');
    handleChange('location_id', '');
    handleChange('tax_name1', '');
    handleChange('tax_rate1', 0);
    handleChange('tax_name2', '');
    handleChange('tax_rate2', 0);
    handleChange('tax_name3', '');
    handleChange('tax_rate3', 0);

    return true;
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <Card
          className="col-span-12 xl:col-span-4 h-max shadow-sm"
          withContainer
          style={{ borderColor: colors.$24 }}
        >
          <ClientSelector
            resource={invoice}
            onChange={(id) => handleChange('client_id', id)}
            onLocationChange={(id) => handleChange('location_id', id)}
            onClearButtonClick={resetInvoiceForm}
            onContactCheckboxChange={handleInvitationChange}
            readonly={searchParams.get('project') === 'true'}
            errorMessage={errors?.errors.client_id}
            disableWithSpinner={searchParams.get('action') === 'create'}
          />
        </Card>

        <InvoiceDetails
          invoice={invoice}
          handleChange={handleChange}
          errors={errors}
        />

        <div className="col-span-12">
          <TabGroup
            tabs={[t('products'), t('tasks')]}
            defaultTabIndex={searchParams.get('table') === 'tasks' ? 1 : 0}
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

        <InvoiceFooter
          invoice={invoice}
          handleChange={handleChange}
          errors={errors}
          isDefaultFooter={isDefaultFooter}
          isDefaultTerms={isDefaultTerms}
          setIsDefaultFooter={setIsDefaultFooter}
          setIsDefaultTerms={setIsDefaultTerms}
        />

        {invoice && (
          <InvoiceTotals
            relationType="client_id"
            resource={invoice}
            invoiceSum={invoiceSum}
            onChange={(property, value) =>
              handleChange(property, value as string)
            }
          />
        )}
      </div>

      {reactSettings?.show_pdf_preview && (
        <div className="my-4">
          {invoice && (
            <InvoicePreview
              for="create"
              resource={invoice}
              entity="invoice"
              relationType="client_id"
              endpoint="/api/v1/live_preview?entity=:entity"
              observable={true}
              initiallyVisible={false}
            />
          )}
        </div>
      )}
    </>
  );
}
