/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { InvoiceItemType } from 'common/interfaces/invoice-item';
import { Quote } from 'common/interfaces/quote';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useBlankQuoteQuery } from 'common/queries/quotes';
import {
  dismissCurrentQuote,
  injectBlankItemIntoCurrent,
  toggleCurrentQuoteInvitation,
} from 'common/stores/slices/quotes';
import { deleteQuoteLineItem } from 'common/stores/slices/quotes/extra-reducers/delete-invoice-item copy';
import { setCurrentLineItemProperty } from 'common/stores/slices/quotes/extra-reducers/set-current-line-item-property';
import { setCurrentQuote } from 'common/stores/slices/quotes/extra-reducers/set-current-quote';
import { setCurrentQuoteLineItem } from 'common/stores/slices/quotes/extra-reducers/set-current-quote-line-item';
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { ValidationAlert } from 'components/ValidationAlert';
import { ClientSelector } from 'pages/invoices/common/components/ClientSelector';
import { InvoicePreview } from 'pages/invoices/common/components/InvoicePreview';
import { InvoiceTotals } from 'pages/invoices/common/components/InvoiceTotals';
import { ProductsTable } from 'pages/invoices/common/components/ProductsTable';
import { useProductColumns } from 'pages/invoices/common/hooks/useProductColumns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { generatePath } from 'react-router-dom';
import { QuoteDetails } from '../common/components/QuoteDetails';
import { QuoteFooter } from '../common/components/QuoteFooter';
import { useCurrentQuote } from '../common/hooks/useCurrentQuote';
import { useInvoiceSum } from '../common/hooks/useInvoiceSum';
import { useSetCurrentQuoteProperty } from '../common/hooks/useSetCurrentQuoteProperty';
import { useHandleCreate } from './hooks/useHandleCreate';

export function Create() {
  const { documentTitle } = useTitle('new_quote');
  const { data: blankQuote } = useBlankQuoteQuery();

  const [errors, setErrors] = useState<ValidationBag>();

  const dispatch = useDispatch();
  const handleChange = useSetCurrentQuoteProperty();

  const currentQuote = useCurrentQuote();
  const invoiceSum = useInvoiceSum();

  const handleCreate = useHandleCreate(setErrors);
  const productColumns = useProductColumns();

  useEffect(() => {
    if (blankQuote?.data.data) {
      dispatch(setCurrentQuote(blankQuote.data.data));
    }

    return () => {
      dispatch(dismissCurrentQuote());
    };
  }, [blankQuote]);

  const [t] = useTranslation();

  const pages: Page[] = [
    { name: t('quotes'), href: '/quotes' },
    {
      name: t('new_quote'),
      href: generatePath('/quotes/create'),
    },
  ];

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={() => handleCreate(currentQuote as Quote)}
      disableSaveButton={currentQuote?.client_id.length === 0}
    >
      {errors && <ValidationAlert errors={errors} />}

      <div className="grid grid-cols-12 gap-4">
        <ClientSelector
          resource={currentQuote}
          onChange={(id) => handleChange('client_id', id)}
          onClearButtonClick={() => handleChange('client_id', '')}
          onContactCheckboxChange={(contactId, value) =>
            dispatch(
              toggleCurrentQuoteInvitation({ contactId, checked: value })
            )
          }
        />

        <QuoteDetails />

        <div className="col-span-12">
          {currentQuote ? (
            <ProductsTable
              relationType="client_id"
              type="product"
              resource={currentQuote}
              columns={productColumns}
              items={currentQuote.line_items.filter(
                (item) => item.type_id == InvoiceItemType.Product
              )}
              onLineItemChange={(index, lineItem) =>
                dispatch(setCurrentQuoteLineItem({ index, lineItem }))
              }
              onLineItemPropertyChange={(key, value, index) =>
                dispatch(
                  setCurrentLineItemProperty({
                    position: index,
                    property: key,
                    value,
                  })
                )
              }
              onSort={(lineItems) => handleChange('line_items', lineItems)}
              onDeleteRowClick={(index) => dispatch(deleteQuoteLineItem(index))}
              onCreateItemClick={() => dispatch(injectBlankItemIntoCurrent())}
            />
          ) : (
            <Spinner />
          )}
        </div>

        <QuoteFooter page="create" />

        {currentQuote && (
          <InvoiceTotals
          relationType='client_id'
            resource={currentQuote}
            invoiceSum={invoiceSum}
            onChange={(property, value) =>
              handleChange(property as keyof Quote, value)
            }
          />
        )}
      </div>

      <div className="my-4">
        {currentQuote && (
          <InvoicePreview
            for="create"
            relationType="client_id"
            resource={currentQuote}
            entity="quote"
          />
        )}
      </div>
    </Default>
  );
}
