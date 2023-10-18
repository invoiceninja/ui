/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { blankInvitation } from '$app/common/constants/blank-invitation';
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useTitle } from '$app/common/hooks/useTitle';
import { Client } from '$app/common/interfaces/client';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { Default, SaveOption } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { ClientSelector } from '$app/pages/invoices/common/components/ClientSelector';
import { InvoicePreview } from '$app/pages/invoices/common/components/InvoicePreview';
import { InvoiceTotals } from '$app/pages/invoices/common/components/InvoiceTotals';
import { ProductsTable } from '$app/pages/invoices/common/components/ProductsTable';
import { useProductColumns } from '$app/pages/invoices/common/hooks/useProductColumns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { invoiceSumAtom, recurringInvoiceAtom } from '../common/atoms';
import { InvoiceDetails } from '../common/components/InvoiceDetails';
import { InvoiceFooter } from '../common/components/InvoiceFooter';
import { useCreate, useRecurringInvoiceUtilities } from '../common/hooks';
import { useBlankRecurringInvoiceQuery } from '../common/queries';
import { Icon } from '$app/components/icons/Icon';
import { MdNotStarted, MdSend } from 'react-icons/md';
import dayjs from 'dayjs';
import { Card } from '$app/components/cards';
import { TabGroup } from '$app/components/TabGroup';
import { useTaskColumns } from '$app/pages/invoices/common/hooks/useTaskColumns';

export default function Create() {
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
  const [searchParams] = useSearchParams();

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
    setRecurringInvoice((current) => {
      let value = current;

      if (searchParams.get('action') !== 'clone') {
        value = undefined;
      }

      if (
        typeof data !== 'undefined' &&
        typeof value === 'undefined' &&
        searchParams.get('action') !== 'clone'
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

        if (searchParams.get('client')) {
          _recurringInvoice.client_id = searchParams.get('client')!;
        }

        if (_recurringInvoice.next_send_date === '') {
          _recurringInvoice.next_send_date = dayjs().format('YYYY-MM-DD');
        }

        _recurringInvoice.uses_inclusive_taxes =
          company?.settings?.inclusive_taxes ?? false;

        _recurringInvoice.auto_bill =
          company?.settings?.auto_bill ?? 'off';

        value = _recurringInvoice;
      }

      return value;
    });
  }, [data]);

  useEffect(() => {
    recurringInvoice && calculateInvoiceSum(recurringInvoice);
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

  const saveOptions: SaveOption[] = [
    {
      onClick: () => save(recurringInvoice as RecurringInvoice, 'send_now'),
      label: t('send_now'),
      icon: <Icon element={MdSend} />,
    },
    {
      onClick: () => save(recurringInvoice as RecurringInvoice, 'start'),
      label: t('start'),
      icon: <Icon element={MdNotStarted} />,
    },
  ];

  const taskColumns = useTaskColumns();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      disableSaveButton={!recurringInvoice?.client_id}
      onSaveClick={() => save(recurringInvoice as RecurringInvoice)}
      additionalSaveOptions={saveOptions}
    >
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
          <ClientSelector
            resource={recurringInvoice}
            onChange={(id) => handleChange('client_id', id)}
            onClearButtonClick={() => handleChange('client_id', '')}
            onContactCheckboxChange={handleInvitationChange}
            errorMessage={errors?.errors.client_id}
            disableWithSpinner={searchParams.get('action') === 'create'}
          />
        </Card>

        <InvoiceDetails handleChange={handleChange} errors={errors} />

        <div className="col-span-12">
          <TabGroup
            tabs={[t('products'), t('tasks')]}
            defaultTabIndex={searchParams.get('table') === 'tasks' ? 1 : 0}
          >
            <div>
              {recurringInvoice && client ? (
                <ProductsTable
                  type="product"
                  resource={recurringInvoice}
                  items={recurringInvoice.line_items.filter((item) =>
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
              {recurringInvoice && client ? (
                <ProductsTable
                  type="task"
                  resource={recurringInvoice}
                  items={recurringInvoice.line_items.filter(
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
        <InvoiceFooter handleChange={handleChange} errors={errors} />

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
            entity="recurring_invoice"
            relationType="client_id"
            endpoint="/api/v1/live_preview?entity=:entity"
          />
        )}
      </div>
    </Default>
  );
}
