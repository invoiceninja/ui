/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { blankInvitation } from 'common/constants/blank-invitation';
import { useClientResolver } from 'common/hooks/clients/useClientResolver';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useTitle } from 'common/hooks/useTitle';
import { Client } from 'common/interfaces/client';
import { Invoice } from 'common/interfaces/invoice';
import { InvoiceItemType } from 'common/interfaces/invoice-item';
import { Invitation } from 'common/interfaces/purchase-order';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useBlankInvoiceQuery } from 'common/queries/invoices';
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { TabGroup } from 'components/TabGroup';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { invoiceAtom, invoiceSumAtom } from '../common/atoms';
import { ClientSelector } from '../common/components/ClientSelector';
import { InvoiceDetails } from '../common/components/InvoiceDetails';
import { InvoiceFooter } from '../common/components/InvoiceFooter';
import { InvoicePreview } from '../common/components/InvoicePreview';
import { InvoiceTotals } from '../common/components/InvoiceTotals';
import { ProductsTable } from '../common/components/ProductsTable';
import { useProductColumns } from '../common/hooks/useProductColumns';
import { useTaskColumns } from '../common/hooks/useTaskColumns';
import { useHandleCreate } from './hooks/useHandleCreate';
import { useInvoiceUtilities } from './hooks/useInvoiceUtilities';

export type ChangeHandler = <T extends keyof Invoice>(
  property: T,
  value: Invoice[typeof property]
) => void;

export function Create() {
  const { t } = useTranslation();
  const { documentTitle } = useTitle('new_invoice');

  const [invoice, setInvoice] = useAtom(invoiceAtom);

  const { data } = useBlankInvoiceQuery({
    enabled: typeof invoice === 'undefined',
  });

  const clientResolver = useClientResolver();
  const company = useCurrentCompany();

  const productColumns = useProductColumns();
  const taskColumns = useTaskColumns();

  const [invoiceSum] = useAtom(invoiceSumAtom);

  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState<ValidationBag>();
  const [client, setClient] = useState<Client | undefined>();

  const pages: Page[] = [
    { name: t('invoices'), href: '/invoices' },
    {
      name: t('new_invoice'),
      href: '/invoices/create',
    },
  ];

  const {
    handleChange,
    calculateInvoiceSum,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
  } = useInvoiceUtilities({ client });

  const save = useHandleCreate(setErrors);

  useEffect(() => {
    if (typeof data !== 'undefined' && typeof invoice === 'undefined') {
      const _invoice = cloneDeep(data);

      if (company && company.enabled_tax_rates > 0) {
        _invoice.tax_name1 = company.settings.tax_name1;
        _invoice.tax_rate1 = company.settings.tax_rate1;
      }

      if (company && company.enabled_tax_rates > 1) {
        _invoice.tax_name2 = company.settings.tax_name2;
        _invoice.tax_rate2 = company.settings.tax_rate2;
      }

      if (company && company.enabled_tax_rates > 2) {
        _invoice.tax_name3 = company.settings.tax_name3;
        _invoice.tax_rate3 = company.settings.tax_rate3;
      }

      if (typeof _invoice.line_items === 'string') {
        _invoice.line_items = [];
      }

      if (searchParams.get('client')) {
        _invoice.client_id = searchParams.get('client')!;
      }

      setInvoice(_invoice);
    }

    return () => {
      setInvoice(undefined);
    };
  }, [data]);

  useEffect(() => {
    invoice &&
      invoice.client_id.length > 1 &&
      clientResolver.find(invoice.client_id).then((client) => {
        setClient(client);

        const invitations: Invitation[] = [];

        client.contacts.map((contact) => {
          if (contact.send_email) {
            const invitation = cloneDeep(
              blankInvitation
            ) as unknown as Invitation;

            invitation.client_contact_id = contact.id;
            invitations.push(invitation);
          }
        });

        handleChange('invitations', invitations);
      });
  }, [invoice?.client_id]);

  useEffect(() => {
    // The InvoiceSum takes exact same reference to the `invoice` object
    // which is the reason we don't have to set a freshly built invoice,
    // rather just modified version.

    invoice && calculateInvoiceSum();
  }, [invoice]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick="/invoices"
      onSaveClick={() => save(invoice as Invoice)}
      disableSaveButton={invoice?.client_id.length === 0}
    >
      <div className="grid grid-cols-12 gap-4">
        <ClientSelector
          resource={invoice}
          onChange={(id) => handleChange('client_id', id)}
          onClearButtonClick={() => handleChange('client_id', '')}
          onContactCheckboxChange={handleInvitationChange}
          readonly={searchParams.get('table') === 'tasks'}
          errorMessage={errors?.errors.client_id}
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
            for="create"
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
