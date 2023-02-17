/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from 'common/helpers/route';
import { useClientResolver } from 'common/hooks/clients/useClientResolver';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { useTitle } from 'common/hooks/useTitle';
import { Client } from 'common/interfaces/client';
import { InvoiceItemType } from 'common/interfaces/invoice-item';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { ResourceActions } from 'components/ResourceActions';
import { Spinner } from 'components/Spinner';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { ClientSelector } from 'pages/invoices/common/components/ClientSelector';
import { InvoicePreview } from 'pages/invoices/common/components/InvoicePreview';
import { InvoiceTotals } from 'pages/invoices/common/components/InvoiceTotals';
import { ProductsTable } from 'pages/invoices/common/components/ProductsTable';
import { useProductColumns } from 'pages/invoices/common/hooks/useProductColumns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { invoiceSumAtom, recurringInvoiceAtom } from '../common/atoms';
import { InvoiceDetails } from '../common/components/InvoiceDetails';
import { InvoiceFooter } from '../common/components/InvoiceFooter';
import {
  useActions,
  useRecurringInvoiceUtilities,
  useSave,
} from '../common/hooks';
import { useRecurringInvoiceQuery } from '../common/queries';

export function Edit() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { documentTitle } = useTitle('edit_recurring_invoice');
  const { data } = useRecurringInvoiceQuery({ id: id! });
  const user = useCurrentUser();

  const showPdfPreview = user?.company_user?.react_settings?.show_pdf_preview;

  const pages: Page[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
    {
      name: t('edit_recurring_invoice'),
      href: route('/recurring_invoices/:id/edit', { id }),
    },
  ];

  const [recurringInvoice, setRecurringInvoice] = useAtom(recurringInvoiceAtom);
  const [invoiceSum] = useAtom(invoiceSumAtom);

  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();

  const clientResolver = useClientResolver();

  const {
    handleChange,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
    calculateInvoiceSum,
  } = useRecurringInvoiceUtilities({ client });

  const productColumns = useProductColumns();

  useEffect(() => {
    if (data) {
      const ri = cloneDeep(data);

      ri.line_items.map((item) => (item._id = v4()));

      setRecurringInvoice(ri);

      if (ri && ri.client) {
        setClient(ri.client);

        clientResolver.cache(ri.client);
      }
    }
  }, [data]);

  useEffect(() => {
    recurringInvoice && calculateInvoiceSum(recurringInvoice);
  }, [recurringInvoice]);

  const actions = useActions();
  const save = useSave({ setErrors });

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick="/recurring_invoices"
      onSaveClick={() => recurringInvoice && save(recurringInvoice)}
      navigationTopRight={
        recurringInvoice && (
          <ResourceActions
            resource={recurringInvoice}
            label={t('more_actions')}
            actions={actions}
          />
        )
      }
    >
      <div className="grid grid-cols-12 gap-4">
        <ClientSelector
          resource={recurringInvoice}
          onChange={(id) => handleChange('client_id', id)}
          onClearButtonClick={() => handleChange('client_id', '')}
          onContactCheckboxChange={handleInvitationChange}
          errorMessage={errors?.errors.client_id}
          readonly
        />

        <InvoiceDetails handleChange={handleChange} errors={errors} />

        <div className="col-span-12">
          {recurringInvoice && client ? (
            <ProductsTable
              type="product"
              resource={recurringInvoice}
              items={recurringInvoice.line_items.filter(
                (item) => item.type_id === InvoiceItemType.Product
              )}
              columns={productColumns}
              relationType="client_id"
              onLineItemChange={handleLineItemChange}
              onSort={(lineItems) => handleChange('line_items', lineItems)}
              onLineItemPropertyChange={handleLineItemPropertyChange}
              onCreateItemClick={handleCreateLineItem}
              onDeleteRowClick={handleDeleteLineItem}
            />
          ) : (
            <Spinner />
          )}
        </div>

        <InvoiceFooter handleChange={handleChange} />

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

      {(showPdfPreview === true || typeof showPdfPreview === 'undefined') && (
        <div className="my-4">
          {recurringInvoice && (
            <InvoicePreview
              for="invoice"
              resource={recurringInvoice}
              entity="recurring_invoice"
              relationType="client_id"
              endpoint="/api/v1/live_preview?entity=:entity"
            />
          )}
        </div>
      )}
    </Default>
  );
}
