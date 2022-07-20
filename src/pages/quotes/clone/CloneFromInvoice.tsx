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
import { useInvoiceQuery } from 'common/queries/invoices';
import {
  dismissCurrentQuote,
  injectBlankItemIntoCurrent,
  toggleCurrentQuoteInvitation,
} from 'common/stores/slices/quotes';
import { deleteQuoteLineItem } from 'common/stores/slices/quotes/extra-reducers/delete-invoice-item copy';
import { setCurrentLineItemProperty } from 'common/stores/slices/quotes/extra-reducers/set-current-line-item-property';
import { setCurrentQuote } from 'common/stores/slices/quotes/extra-reducers/set-current-quote';
import { setCurrentQuoteLineItem } from 'common/stores/slices/quotes/extra-reducers/set-current-quote-line-item';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { ValidationAlert } from 'components/ValidationAlert';
import { ClientSelector } from 'pages/invoices/common/components/ClientSelector';
import { InvoicePreview } from 'pages/invoices/common/components/InvoicePreview';
import { InvoiceTotals } from 'pages/invoices/common/components/InvoiceTotals';
import { ProductsTable } from 'pages/invoices/common/components/ProductsTable';
import { useProductColumns } from 'pages/invoices/common/hooks/useProductColumns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { generatePath, useParams } from 'react-router-dom';
import { QuoteDetails } from '../common/components/QuoteDetails';
import { QuoteFooter } from '../common/components/QuoteFooter';
import { useCurrentQuote } from '../common/hooks/useCurrentQuote';
import { useInvoiceSum } from '../common/hooks/useInvoiceSum';
import { useSetCurrentQuoteProperty } from '../common/hooks/useSetCurrentQuoteProperty';
import { useHandleCreate } from '../create/hooks/useHandleCreate';

export function CloneInvoiceToQuote() {
  const { documentTitle } = useTitle('clone_to_quote');
  const { id } = useParams();
  const { data: invoice } = useInvoiceQuery({ id });

  const [errors, setErrors] = useState<ValidationBag>();

  const [t] = useTranslation();

  const dispatch = useDispatch();
  const handleChange = useSetCurrentQuoteProperty();
  const handleSave = useHandleCreate(setErrors);

  const currentQuote = useCurrentQuote();
  const invoiceSum = useInvoiceSum();
  const productColumns = useProductColumns();

  const pages: BreadcrumRecord[] = [
    { name: t('invoices'), href: '/invoices' },
    {
      name: t('clone_to_quote'),
      href: generatePath('/invoices/:id/clone/quote', { id }),
    },
  ];

  useEffect(() => {
    if (invoice?.data.data) {
      dispatch(
        setCurrentQuote({ ...invoice.data.data, number: '', documents: [] })
      );
    }

    return () => {
      dispatch(dismissCurrentQuote());
    };
  }, [invoice]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={() => handleSave(currentQuote as Quote)}
    >
      {errors && <ValidationAlert errors={errors} />}

      <div className="grid grid-cols-12 gap-4">
        {currentQuote && (
          <ClientSelector
            resource={currentQuote}
            readonly
            onChange={(id) => handleChange('client_id', id)}
            onClearButtonClick={() => handleChange('client_id', '')}
            onContactCheckboxChange={(contactId, value) =>
              dispatch(
                toggleCurrentQuoteInvitation({ contactId, checked: value })
              )
            }
          />
        )}

        <QuoteDetails />

        <div className="col-span-12">
          {currentQuote && (
            <ProductsTable
            type="product"
              columns={productColumns}
              items={currentQuote.line_items.filter(
                (item) => item.type_id == InvoiceItemType.Product
              )}
              resource={currentQuote}
              onProductChange={(index, lineItem) =>
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
          )}
        </div>

        <QuoteFooter page="edit" />

        {currentQuote && (
          <InvoiceTotals
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
            for="invoice"
            resource={currentQuote}
            entity="quote"
          />
        )}
      </div>
    </Default>
  );
}
