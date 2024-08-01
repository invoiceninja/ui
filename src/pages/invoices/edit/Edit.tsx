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
import { Client } from '$app/common/interfaces/client';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { useInvoiceQuery } from '$app/common/queries/invoices';
import { Spinner } from '$app/components/Spinner';
import { TabGroup } from '$app/components/TabGroup';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { v4 } from 'uuid';
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
import { Invoice as IInvoice } from '$app/common/interfaces/invoice';
import { useAtomWithPrevent } from '$app/common/hooks/useAtomWithPrevent';
import { Context } from './components/EInvoice';

export default function Edit() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const context: Context = useOutletContext();

  const {
    invoice,
    setInvoice,
    isDefaultTerms,
    setIsDefaultTerms,
    isDefaultFooter,
    setIsDefaultFooter,
    errors,
  } = context;

  const reactSettings = useReactSettings();

  const taskColumns = useTaskColumns();
  const productColumns = useProductColumns();

  const { data } = useInvoiceQuery({ id });

  const [invoice, setInvoice] = useAtomWithPrevent(invoiceAtom);
  const [invoiceSum] = useAtom(invoiceSumAtom);

  const [client, setClient] = useState<Client | undefined>();

  const {
    handleChange,
    handleInvitationChange,
    calculateInvoiceSum,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
  } = useInvoiceUtilities({ client });

  useEffect(() => {
    const isAnyAction = searchParams.get('action');

    const currentInvoice = isAnyAction && invoice ? invoice : data;

    if (currentInvoice) {
      const _invoice = cloneDeep(currentInvoice);

      _invoice.line_items.map((lineItem) => (lineItem._id = v4()));

      setInvoice(_invoice);

      if (_invoice?.client) {
        setClient(_invoice.client);
      }
    }
  }, [data]);

  useEffect(() => {
    invoice && calculateInvoiceSum(invoice);
  }, [invoice]);

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

          <ClientSelector
            resource={invoice}
            onChange={(id) => handleChange('client_id', id)}
            onClearButtonClick={() => handleChange('client_id', '')}
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
