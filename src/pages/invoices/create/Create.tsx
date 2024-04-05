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
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useTitle } from '$app/common/hooks/useTitle';
import { Client } from '$app/common/interfaces/client';
import { Invoice } from '$app/common/interfaces/invoice';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { Invitation } from '$app/common/interfaces/purchase-order';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankInvoiceQuery } from '$app/common/queries/invoices';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
import { TabGroup } from '$app/components/TabGroup';
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
import { Card } from '$app/components/cards';
import { Settings as CompanySettings } from '$app/common/interfaces/company.interface';

export type ChangeHandler = <T extends keyof Invoice>(
  property: T,
  value: Invoice[typeof property]
) => void;

export default function Create() {
  const { t } = useTranslation();
  const { documentTitle } = useTitle('new_invoice');

  const reactSettings = useReactSettings();

  const [invoice, setInvoice] = useAtom(invoiceAtom);

  const { data } = useBlankInvoiceQuery({
    enabled: typeof invoice === 'undefined',
  });

  const clientResolver = useClientResolver();
  const company = useCurrentCompany();

  const productColumns = useProductColumns();
  const taskColumns = useTaskColumns();

  const [invoiceSum, setInvoiceSum] = useAtom(invoiceSumAtom);

  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState<ValidationBag>();
  const [client, setClient] = useState<Client | undefined>();
  const [isDefaultTerms, setIsDefaultTerms] = useState<boolean>(false);
  const [isDefaultFooter, setIsDefaultFooter] = useState<boolean>(false);

  const resetInvoiceForm = () => {
    handleChange('client_id', '');
    handleChange('tax_name1', '');
    handleChange('tax_rate1', 0);
    handleChange('tax_name2', '');
    handleChange('tax_rate2', 0);
    handleChange('tax_name3', '');
    handleChange('tax_rate3', 0);

    return true;
  };

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

  const save = useHandleCreate({ setErrors, isDefaultTerms, isDefaultFooter });

  useEffect(() => {
    setInvoiceSum(undefined);

    setInvoice((current) => {
      let value = current;

      if (
        searchParams.get('action') !== 'clone' &&
        searchParams.get('action') !== 'invoice_project' &&
        searchParams.get('action') !== 'invoice_task' &&
        searchParams.get('action') !== 'invoice_expense' &&
        searchParams.get('action') !== 'invoice_product'
      ) {
        value = undefined;
      }

      if (
        typeof data !== 'undefined' &&
        typeof value === 'undefined' &&
        searchParams.get('action') !== 'clone'
      ) {
        const _invoice = cloneDeep(data);

        if (typeof _invoice.line_items === 'string') {
          _invoice.line_items = [];
        }

        if (searchParams.get('client')) {
          _invoice.client_id = searchParams.get('client')!;
        }

        _invoice.uses_inclusive_taxes =
          company?.settings?.inclusive_taxes ?? false;

        value = _invoice;
      }

      return value;
    });

    return () => {
      setInvoice(undefined);
    };
  }, [data]);

  const settingResolver = (client: Client, prop: string) => {
    if (client?.settings && client?.settings[prop]) {
      return client.settings[prop];
    }

    if (client?.group_settings && client?.group_settings?.settings[prop]) {
      return client?.group_settings?.settings[prop];
    }

    return company?.settings[prop as keyof CompanySettings];
  };

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

        if (company && company.enabled_tax_rates > 0) {
          handleChange('tax_name1', settingResolver(client, 'tax_name1'));
          handleChange('tax_rate1', settingResolver(client, 'tax_rate1'));
        }

        if (company && company.enabled_tax_rates > 1) {
          handleChange('tax_name2', settingResolver(client, 'tax_name2'));
          handleChange('tax_rate2', settingResolver(client, 'tax_rate2'));
        }

        if (company && company.enabled_tax_rates > 2) {
          handleChange('tax_name3', settingResolver(client, 'tax_name3'));
          handleChange('tax_rate3', settingResolver(client, 'tax_rate3'));
        }
      });
  }, [invoice?.client_id]);

  useEffect(() => {
    invoice && calculateInvoiceSum(invoice);
  }, [invoice]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={() => save(invoice as Invoice)}
      disableSaveButton={invoice?.client_id.length === 0}
    >
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
          <ClientSelector
            resource={invoice}
            onChange={(id) => handleChange('client_id', id)}
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
    </Default>
  );
}
