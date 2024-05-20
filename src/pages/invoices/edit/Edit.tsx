/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceStatus } from '$app/common/enums/invoice-status';
import { route } from '$app/common/helpers/route';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useTitle } from '$app/common/hooks/useTitle';
import { Client } from '$app/common/interfaces/client';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useInvoiceQuery } from '$app/common/queries/invoices';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { TabGroup } from '$app/components/TabGroup';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { invoiceAtom, invoiceSumAtom } from '../common/atoms';
import { ClientSelector } from '../common/components/ClientSelector';
import { InvoiceDetails } from '../common/components/InvoiceDetails';
import { InvoiceFooter } from '../common/components/InvoiceFooter';
import { InvoicePreview } from '../common/components/InvoicePreview';
import { InvoiceTotals } from '../common/components/InvoiceTotals';
import { ProductsTable } from '../common/components/ProductsTable';
import { useProductColumns } from '../common/hooks/useProductColumns';
import { useTaskColumns } from '../common/hooks/useTaskColumns';
import { useInvoiceUtilities } from '../create/hooks/useInvoiceUtilities';
import { useActions } from './components/Actions';
import { useHandleSave } from './hooks/useInvoiceSave';
import { Card } from '$app/components/cards';
import { InvoiceStatus as InvoiceStatusBadge } from '../common/components/InvoiceStatus';
import { CommonActions } from './components/CommonActions';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { Invoice as IInvoice } from '$app/common/interfaces/invoice';

export default function Edit() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const reactSettings = useReactSettings();

  const pages: Page[] = [
    { name: t('invoices'), href: '/invoices' },
    {
      name: t('edit_invoice'),
      href: route('/invoices/:id/edit', { id }),
    },
  ];

  const productColumns = useProductColumns();
  const taskColumns = useTaskColumns();

  const { documentTitle } = useTitle('edit_invoice');
  const { data } = useInvoiceQuery({ id });

  const [invoice, setInvoice] = useAtom(invoiceAtom);
  const [invoiceSum] = useAtom(invoiceSumAtom);

  const [client, setClient] = useState<Client | undefined>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isDefaultTerms, setIsDefaultTerms] = useState<boolean>(false);
  const [isDefaultFooter, setIsDefaultFooter] = useState<boolean>(false);

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

  const actions = useActions();
  const save = useHandleSave({ setErrors, isDefaultTerms, isDefaultFooter });

  const { changeTemplateVisible, setChangeTemplateVisible } =
    useChangeTemplate();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      {...((hasPermission('edit_invoice') || entityAssigned(invoice)) &&
        invoice && {
          navigationTopRight: (
            <ResourceActions
              resource={invoice}
              actions={actions}
              onSaveClick={() => invoice && save(invoice)}
              disableSaveButton={
                invoice &&
                (invoice.status_id === InvoiceStatus.Cancelled ||
                  invoice.is_deleted)
              }
              cypressRef="invoiceActionDropdown"
            />
          ),
          topRight: <CommonActions invoice={invoice} />,
        })}
    >
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
    </Default>
  );
}
