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
import { invoiceSumAtom, quoteAtom } from '../common/atoms';
import { QuoteDetails } from '../common/components/QuoteDetails';
import { QuoteFooter } from '../common/components/QuoteFooter';
import { useActions, useQuoteUtilities, useSave } from '../common/hooks';
import { useQuoteQuery } from '../common/queries';

export function Edit() {
  const { documentTitle } = useTitle('edit_quote');
  const { t } = useTranslation();
  const { id } = useParams();
  const user = useCurrentUser();

  const showPdfPreview = user?.company_user?.react_settings?.show_pdf_preview;

  const pages: Page[] = [
    { name: t('quotes'), href: '/quotes' },
    {
      name: t('edit_quote'),
      href: route('/quotes/:id/edit', { id }),
    },
  ];

  const { data } = useQuoteQuery({ id: id! });

  const [quote, setQuote] = useAtom(quoteAtom);
  const [invoiceSum] = useAtom(invoiceSumAtom);

  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();

  const productColumns = useProductColumns();
  const clientResolver = useClientResolver();

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
    if (data) {
      const _quote = cloneDeep(data);

      _quote.line_items.map((item) => (item._id = v4()));

      setQuote(_quote);

      if (_quote && _quote.client) {
        setClient(_quote.client);

        clientResolver.cache(_quote.client);
      }
    }
  }, [data]);

  useEffect(() => {
    quote && calculateInvoiceSum(quote);
  }, [quote]);

  const actions = useActions();
  const save = useSave({ setErrors });

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick="/quotes"
      onSaveClick={() => quote && save(quote)}
      navigationTopRight={
        quote && (
          <ResourceActions
            resource={quote}
            label={t('more_actions')}
            actions={actions}
          />
        )
      }
    >
      <div className="grid grid-cols-12 gap-4">
        <ClientSelector
          resource={quote}
          onChange={(id) => handleChange('client_id', id)}
          onClearButtonClick={() => handleChange('client_id', '')}
          onContactCheckboxChange={handleInvitationChange}
          errorMessage={errors?.errors.client_id}
          readonly
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

      {(showPdfPreview === true || typeof showPdfPreview === 'undefined') && (
        <div className="my-4">
          {quote && (
            <InvoicePreview
              for="invoice"
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
