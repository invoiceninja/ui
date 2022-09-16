/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useClientResolver } from 'common/hooks/clients/useClientResolver';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useTitle } from 'common/hooks/useTitle';
import { Client } from 'common/interfaces/client';
import { InvoiceItemType } from 'common/interfaces/invoice-item';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { blankInvitation } from 'common/stores/slices/invoices/constants/blank-invitation';
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
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
import { invoiceSumAtom, recurringInvoiceAtom } from '../common/atoms';
import { InvoiceDetails } from '../common/components/InvoiceDetails';
import { InvoiceFooter } from '../common/components/InvoiceFooter';
import { useCreate, useRecurringInvoiceUtilities } from '../common/hooks';
import { useBlankRecurringInvoiceQuery } from '../common/queries';

export function Create() {
  const { documentTitle } = useTitle('new_recurring_invoice');
  const { t } = useTranslation();

  const pages: Page[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
    {
      name: t('new_recurring_invoice'),
      href: '/recurring_invoices/create',
    },
  ];

  const [recurringInvoice, setRecurringInvoice] = useAtom(recurringInvoiceAtom);
  const [invoiceSum] = useAtom(invoiceSumAtom);

  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();

  const clientResolver = useClientResolver();
  const company = useCurrentCompany();
  const productColumns = useProductColumns();

  const {
    handleChange,
    calculateInvoiceSum,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
  } = useRecurringInvoiceUtilities({
    client,
  });

  const { data } = useBlankRecurringInvoiceQuery({
    enabled: typeof recurringInvoice === 'undefined',
  });

  useEffect(() => {
    if (
      typeof data !== 'undefined' &&
      typeof recurringInvoice === 'undefined'
    ) {
      const _recurringInvoice = cloneDeep(data);

      if (company && company.enabled_tax_rates > 0) {
        _recurringInvoice.tax_name1 = company.settings.tax_name1;
        _recurringInvoice.tax_rate1 = company.settings.tax_rate1;
      }

      if (company && company.enabled_tax_rates > 1) {
        _recurringInvoice.tax_name2 = company.settings.tax_name2;
        _recurringInvoice.tax_rate2 = company.settings.tax_rate2;
      }

      if (company && company.enabled_tax_rates > 2) {
        _recurringInvoice.tax_name3 = company.settings.tax_name3;
        _recurringInvoice.tax_rate3 = company.settings.tax_rate3;
      }

      if (typeof _recurringInvoice.line_items === 'string') {
        _recurringInvoice.line_items = [];
      }

      setRecurringInvoice(_recurringInvoice);
    }

    return () => {
      setRecurringInvoice(undefined);
    };
  }, [data]);

  useEffect(() => {
    // The InvoiceSum takes exact same reference to the `invoice` object
    // which is the reason we don't have to set a freshly built invoice,
    // rather just modified version.

    recurringInvoice && calculateInvoiceSum();
  }, [recurringInvoice]);

  useEffect(() => {
    recurringInvoice &&
      recurringInvoice.client_id.length > 1 &&
      clientResolver.find(recurringInvoice.client_id).then((client) => {
        setClient(client);

        const invitations: Record<string, unknown>[] = [];

        client.contacts.map((contact) => {
          if (contact.send_email) {
            const invitation = cloneDeep(blankInvitation);

            invitation.client_contact_id = contact.id;
            invitations.push(invitation);
          }
        });

        handleChange('invitations', invitations);
      });
  }, [recurringInvoice?.client_id]);

  const save = useCreate({ setErrors });

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick="/recurring_invoices"
      onSaveClick={() => save(recurringInvoice as RecurringInvoice)}
      disableSaveButton={recurringInvoice?.client_id.length === 0}
    >
      <div className="grid grid-cols-12 gap-4">
        <ClientSelector
          resource={recurringInvoice}
          onChange={(id) => handleChange('client_id', id)}
          onClearButtonClick={() => handleChange('client_id', '')}
          onContactCheckboxChange={handleInvitationChange}
          errorMessage={errors?.errors.client_id}
        />

        <InvoiceDetails handleChange={handleChange} />

        <div className="col-span-12">
          {recurringInvoice ? (
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

      <div className="my-4">
        {recurringInvoice && (
          <InvoicePreview
            for="create"
            resource={recurringInvoice}
            entity="invoice"
            relationType="client_id"
            endpoint="/api/v1/live_preview?entity=:entity"
          />
        )}
      </div>
    </Default>
  );
}
