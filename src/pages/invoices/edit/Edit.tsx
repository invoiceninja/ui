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
import { TabGroup } from '$app/components/TabGroup';
import { useAtom } from 'jotai';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useNavigate,
  useOutletContext,
  useSearchParams,
} from 'react-router-dom';
import { invoiceSumAtom } from '../common/atoms';
import { ClientSelector } from '../common/components/ClientSelector';
import { InvoiceDetails } from '../common/components/InvoiceDetails';
import { InvoiceFooter } from '../common/components/InvoiceFooter';
import { InvoicePreview } from '../common/components/InvoicePreview';
import { InvoiceTotals } from '../common/components/InvoiceTotals';
import { ProductsTable } from '../common/components/ProductsTable';
import { useProductColumns } from '../common/hooks/useProductColumns';
import { useTaskColumns } from '../common/hooks/useTaskColumns';
import { useInvoiceUtilities } from '../create/hooks/useInvoiceUtilities';
import { Card } from '$app/components/cards';
import { InvoiceStatus as InvoiceStatusBadge } from '../common/components/InvoiceStatus';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { Invoice as IInvoice, Invoice } from '$app/common/interfaces/invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Client } from '$app/common/interfaces/client';
import { Assigned } from '$app/components/Assigned';
import { route } from '$app/common/helpers/route';
import { Project } from '$app/common/interfaces/project';
import { Icon } from '$app/components/icons/Icon';
import { ExternalLink } from 'react-feather';

export interface Context {
  invoice: Invoice | undefined;
  setInvoice: Dispatch<SetStateAction<Invoice | undefined>>;
  isDefaultTerms: boolean;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
  isDefaultFooter: boolean;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
  errors: ValidationBag | undefined;
  client: Client | undefined;
}

export default function Edit() {
  const [t] = useTranslation();

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const context: Context = useOutletContext();
  const {
    invoice,
    isDefaultTerms,
    setIsDefaultTerms,
    isDefaultFooter,
    setIsDefaultFooter,
    errors,
    client,
  } = context;

  const taskColumns = useTaskColumns();
  const reactSettings = useReactSettings();
  const productColumns = useProductColumns();

  const [invoiceSum] = useAtom(invoiceSumAtom);

  const {
    handleChange,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
  } = useInvoiceUtilities({ client });

  const { changeTemplateVisible, setChangeTemplateVisible } =
    useChangeTemplate();

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
          {invoice && (
            <div className="flex space-x-20">
              <span className="text-sm">{t('status')}</span>

              <InvoiceStatusBadge entity={invoice} />
            </div>
          )}

          <Assigned
            entityId={invoice?.project_id}
            cacheEndpoint="/api/v1/projects"
            apiEndpoint="/api/v1/projects/:id?include=client"
            componentCallbackFn={(resource: Project) => (
              <div className="flex space-x-20">
                <span className="text-sm">{t('project')}</span>

                <div className="flex items-center space-x-2">
                  <span className="text-sm">{resource.name}</span>

                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(
                        route('/projects/:id', { id: invoice?.project_id })
                      )
                    }
                  >
                    <Icon
                      element={ExternalLink}
                      style={{ width: '1.17rem', height: '1.17rem' }}
                    />
                  </div>
                </div>
              </div>
            )}
          />

          <ClientSelector
            resource={invoice}
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
              {invoice && client ? (
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
              {invoice && client ? (
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
              for="invoice"
              resource={invoice}
              entity="invoice"
              relationType="client_id"
              endpoint="/api/v1/live_preview?entity=:entity"
              observable={true}
              initiallyVisible={false}
              withRemoveLogoCTA
            />
          )}
        </div>
      )}

      {invoice ? (
        <ChangeTemplateModal<IInvoice>
          entity="invoice"
          entities={[invoice]}
          visible={changeTemplateVisible}
          setVisible={setChangeTemplateVisible}
          labelFn={(invoice) => `${t('number')}: ${invoice.number}`}
          bulkUrl="/api/v1/invoices/bulk"
        />
      ) : null}
    </>
  );
}
