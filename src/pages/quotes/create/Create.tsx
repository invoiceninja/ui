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
import { isProduction } from 'common/helpers';
import { useClientResolver } from 'common/hooks/clients/useClientResolver';
import { useTitle } from 'common/hooks/useTitle';
import { Client } from 'common/interfaces/client';
import { InvoiceItemType } from 'common/interfaces/invoice-item';
import { ValidationBag } from 'common/interfaces/validation-bag';
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
import { useSearchParams } from 'react-router-dom';
import { invoiceSumAtom, quoteAtom } from '../common/atoms';
import { QuoteDetails } from '../common/components/QuoteDetails';
import { QuoteFooter } from '../common/components/QuoteFooter';
import { useCreate, useQuoteUtilities } from '../common/hooks';
import { useBlankQuoteQuery } from '../common/queries';

export function Create() {
  const { documentTitle } = useTitle('new_quote');
  const { t } = useTranslation();

  const pages: Page[] = [
    { name: t('quotes'), href: '/quotes' },
    {
      name: t('new_quote'),
      href: '/quotes/create',
    },
  ];

  const [searchParams] = useSearchParams();

  const [quote, setQuote] = useAtom(quoteAtom);
  const [invoiceSum] = useAtom(invoiceSumAtom);

  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();

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

        return (value = _quote);
      }

      return value;
    });
  }, [data]);

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
      });
  }, [quote?.client_id]);

  useEffect(() => {
    quote && calculateInvoiceSum(quote);
  }, [quote]);

  const save = useCreate({ setErrors });

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick="/quotes"
      onSaveClick={() => save(quote!)}
      disableSaveButton={quote?.client_id.length === 0}
    >
      <div className="grid grid-cols-12 gap-4">
        <ClientSelector
          resource={quote}
          onChange={(id) => handleChange('client_id', id)}
          onClearButtonClick={() => handleChange('client_id', '')}
          onContactCheckboxChange={handleInvitationChange}
          errorMessage={errors?.errors.client_id}
          disableWithSpinner={searchParams.get('action') === 'create'}
        />

        <QuoteDetails handleChange={handleChange} errors={errors} />

        <div className="col-span-12">
          {quote && client ? (
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
              onCreateItemClick={handleCreateLineItem}
              onDeleteRowClick={handleDeleteLineItem}
            />
          ) : (
            <Spinner />
          )}
        </div>

        <QuoteFooter handleChange={handleChange} />

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
    </Default>
  );
}
