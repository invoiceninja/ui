/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceStatus } from 'common/enums/invoice-status';
import { route } from 'common/helpers/route';
import { useClientResolver } from 'common/hooks/clients/useClientResolver';
import { useTitle } from 'common/hooks/useTitle';
import { Client } from 'common/interfaces/client';
import { InvoiceItemType } from 'common/interfaces/invoice-item';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useInvoiceQuery } from 'common/queries/invoices';
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { ResourceActions } from 'components/ResourceActions';
import { Spinner } from 'components/Spinner';
import { TabGroup } from 'components/TabGroup';
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

export function Edit() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

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

  const clientResolver = useClientResolver();

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
    if (data) {
      const _invoice = cloneDeep(data);

      _invoice.line_items.map((lineItem) => (lineItem._id = v4()));

      setInvoice(_invoice);

      if (_invoice?.client) {
        setClient(_invoice.client);

        clientResolver.cache(_invoice.client);
      }
    }
  }, [data]);

  useEffect(() => {
    // The InvoiceSum takes exact same reference to the `invoice` object
    // which is the reason we don't have to set a freshly built invoice,
    // rather just modified version.

    invoice && calculateInvoiceSum(invoice);
  }, [invoice]);

  const actions = useActions();
  const save = useHandleSave(setErrors);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick="/invoices"
      onSaveClick={() => invoice && save(invoice)}
      disableSaveButton={
        invoice &&
        (invoice.status_id === InvoiceStatus.Cancelled || invoice.is_deleted)
      }
      navigationTopRight={
        invoice && (
          <ResourceActions
            label={t('more_actions')}
            resource={invoice}
            actions={actions}
          />
        )
      }
    >
      <div className="grid grid-cols-12 gap-4">
        <ClientSelector
          resource={invoice}
          onChange={(id) => handleChange('client_id', id)}
          onClearButtonClick={() => handleChange('client_id', '')}
          onContactCheckboxChange={handleInvitationChange}
          errorMessage={errors?.errors.client_id}
          readonly
        />

        <InvoiceDetails invoice={invoice} handleChange={handleChange} />

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
                  items={invoice.line_items.filter(
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
              {invoice && client ? (
                <ProductsTable
                  type="task"
                  resource={invoice}
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

        <InvoiceFooter invoice={invoice} handleChange={handleChange} />

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

      <div className="my-4">
        {invoice && (
          <InvoicePreview
            for="invoice"
            resource={invoice}
            entity="invoice"
            relationType="client_id"
            endpoint="/api/v1/live_preview?entity=:entity"
          />
        )}
      </div>
    </Default>
  );
}
