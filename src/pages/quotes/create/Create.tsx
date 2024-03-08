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
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useTitle } from '$app/common/hooks/useTitle';
import { Client } from '$app/common/interfaces/client';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
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
import { invoiceSumAtom, quoteAtom } from '../common/atoms';
import { QuoteDetails } from '../common/components/QuoteDetails';
import { QuoteFooter } from '../common/components/QuoteFooter';
import { useCreate, useQuoteUtilities } from '../common/hooks';
import { useBlankQuoteQuery } from '../common/queries';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Card } from '$app/components/cards';
import { TabGroup } from '$app/components/TabGroup';
import { useTaskColumns } from '$app/pages/invoices/common/hooks/useTaskColumns';
import { Settings as CompanySettings } from '$app/common/interfaces/company.interface';

export default function Create() {
  const { documentTitle } = useTitle('new_quote');
  const { t } = useTranslation();

  const reactSettings = useReactSettings();

  const pages: Page[] = [
    { name: t('quotes'), href: '/quotes' },
    {
      name: t('new_quote'),
      href: '/quotes/create',
    },
  ];
  const company = useCurrentCompany();

  const [searchParams] = useSearchParams();

  const [quote, setQuote] = useAtom(quoteAtom);
  const [invoiceSum] = useAtom(invoiceSumAtom);

  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isDefaultTerms, setIsDefaultTerms] = useState<boolean>(false);
  const [isDefaultFooter, setIsDefaultFooter] = useState<boolean>(false);

  const clientResolver = useClientResolver();
  const productColumns = useProductColumns();

  const { data } = useBlankQuoteQuery({
    enabled: typeof quote === 'undefined',
  });

  const {
    handleChange,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
    calculateInvoiceSum,
  } = useQuoteUtilities({ client });

  useEffect(() => {
    setQuote((current) => {
      let value = current;

      if (searchParams.get('action') !== 'clone') {
        value = undefined;
      }

      if (
        typeof data !== 'undefined' &&
        typeof value === 'undefined' &&
        searchParams.get('action') !== 'clone'
      ) {
        const _quote = cloneDeep(data);

        if (typeof _quote.line_items === 'string') {
          _quote.line_items = [];
        }

        if (searchParams.get('client')) {
          _quote.client_id = searchParams.get('client')!;
        }

        _quote.uses_inclusive_taxes =
          company?.settings?.inclusive_taxes ?? false;

        return (value = _quote);
      }

      return value;
    });

    return () => {
      setQuote(undefined);
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
    quote &&
      quote.client_id.length > 1 &&
      clientResolver.find(quote.client_id).then((client) => {
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
  }, [quote?.client_id]);

  useEffect(() => {
    quote && calculateInvoiceSum(quote);
  }, [quote]);

  const save = useCreate({ setErrors, isDefaultFooter, isDefaultTerms });
  const taskColumns = useTaskColumns();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={() => save(quote!)}
      disableSaveButton={quote?.client_id.length === 0}
    >
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
          <ClientSelector
            resource={quote}
            onChange={(id) => handleChange('client_id', id)}
            onClearButtonClick={() => handleChange('client_id', '')}
            onContactCheckboxChange={handleInvitationChange}
            errorMessage={errors?.errors.client_id}
            disableWithSpinner={searchParams.get('action') === 'create'}
          />
        </Card>

        <QuoteDetails handleChange={handleChange} errors={errors} />

        <div className="col-span-12">
          <TabGroup
            tabs={[t('products'), t('tasks')]}
            defaultTabIndex={searchParams.get('table') === 'tasks' ? 1 : 0}
          >
            <div>
              {quote ? (
                <ProductsTable
                  type="product"
                  resource={quote}
                  items={quote.line_items.filter(
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
              {quote ? (
                <ProductsTable
                  type="task"
                  resource={quote}
                  items={quote.line_items.filter(
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

        <QuoteFooter
          handleChange={handleChange}
          errors={errors}
          isDefaultFooter={isDefaultFooter}
          isDefaultTerms={isDefaultTerms}
          setIsDefaultFooter={setIsDefaultFooter}
          setIsDefaultTerms={setIsDefaultTerms}
        />

        {quote && (
          <InvoiceTotals
            relationType="client_id"
            resource={quote}
            invoiceSum={invoiceSum}
            onChange={(property, value) =>
              handleChange(property, value as string)
            }
          />
        )}
      </div>

      {reactSettings?.show_pdf_preview && (
        <div className="my-4">
          {quote && (
            <InvoicePreview
              for="create"
              resource={quote}
              entity="quote"
              relationType="client_id"
              endpoint="/api/v1/live_preview?entity=:entity"
            />
          )}
        </div>
      )}
    </Default>
  );
}
