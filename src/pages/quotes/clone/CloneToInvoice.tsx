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
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { generatePath, useParams } from 'react-router-dom';
import { setCurrentInvoice } from 'common/stores/slices/invoices/extra-reducers/set-current-invoice';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { Invoice } from 'common/interfaces/invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { ValidationAlert } from 'components/ValidationAlert';
import {
  dismissCurrentInvoice,
  injectBlankItemIntoCurrent,
  toggleCurrentInvoiceInvitation,
} from 'common/stores/slices/invoices';
import { setCurrentInvoiceLineItem } from 'common/stores/slices/invoices/extra-reducers/set-current-invoice-line-item';
import { setCurrentLineItemProperty } from 'common/stores/slices/invoices/extra-reducers/set-current-line-item-property';
import { deleteInvoiceLineItem } from 'common/stores/slices/invoices/extra-reducers/delete-invoice-item';
import { useSetCurrentInvoiceProperty } from 'pages/invoices/common/hooks/useSetCurrentInvoiceProperty';
import { useQuoteQuery } from 'common/queries/quotes';
import { ClientSelector } from 'pages/invoices/common/components/ClientSelector';
import { ProductsTable } from 'pages/invoices/common/components/ProductsTable';
import { InvoiceFooter } from 'pages/invoices/common/components/InvoiceFooter';
import { InvoiceTotals } from 'pages/invoices/common/components/InvoiceTotals';
import { InvoicePreview } from 'pages/invoices/common/components/InvoicePreview';
import { InvoiceDetails } from 'pages/invoices/common/components/InvoiceDetails';
import { useHandleCreate } from 'pages/invoices/create/hooks/useHandleCreate';
import { useInvoiceSum } from 'pages/invoices/common/hooks/useInvoiceSum';
import { InvoiceItemType } from 'common/interfaces/invoice-item';
import { useProductColumns } from 'pages/invoices/common/hooks/useProductColumns';

export function CloneToInvoice() {
  const { documentTitle } = useTitle('new_invoice');
  const { id } = useParams();
  const { data: invoice } = useQuoteQuery({ id });
  const [t] = useTranslation();

  const [errors, setErrors] = useState<ValidationBag>();

  const dispatch = useDispatch();
  const handleCreate = useHandleCreate(setErrors);
  const handleChange = useSetCurrentInvoiceProperty();
  const invoiceSum = useInvoiceSum();
  const productColumns = useProductColumns();

  const currentInvoice = useCurrentInvoice();

  const pages: BreadcrumRecord[] = [
    { name: t('invoices'), href: '/invoices' },
    {
      name: t('new_invoice'),
      href: generatePath('/invoices/create'),
    },
  ];

  useEffect(() => {
    if (invoice?.data.data) {
      dispatch(
        setCurrentInvoice({
          ...invoice.data.data,
          number: '',
          documents: [],
        })
      );
    }

    return () => {
      dispatch(dismissCurrentInvoice());
    };
  }, [invoice]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick={generatePath('/invoices')}
      onSaveClick={() => handleCreate(currentInvoice as Invoice)}
    >
      {errors && <ValidationAlert errors={errors} />}

      <div className="grid grid-cols-12 gap-4">
          <ClientSelector
            resource={currentInvoice}
            onChange={(id) => handleChange('client_id', id)}
            onClearButtonClick={() => handleChange('client_id', '')}
            onContactCheckboxChange={(contactId, value) =>
              dispatch(
                toggleCurrentInvoiceInvitation({ contactId, checked: value })
              )
            }
          />

        <InvoiceDetails />

        <div className="col-span-12">
          {currentInvoice && (
            <ProductsTable
              type="product"
              columns={productColumns}
              items={currentInvoice.line_items.filter(
                (item) => item.type_id == InvoiceItemType.Product
              )}
              resource={currentInvoice}
              onProductChange={(index, lineItem) =>
                dispatch(setCurrentInvoiceLineItem({ index, lineItem }))
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
              onDeleteRowClick={(index) =>
                dispatch(deleteInvoiceLineItem(index))
              }
              onCreateItemClick={() =>
                dispatch(
                  injectBlankItemIntoCurrent({ type: InvoiceItemType.Product })
                )
              }
            />
          )}
        </div>

        <InvoiceFooter page="create" />

        {currentInvoice && (
          <InvoiceTotals
            resource={currentInvoice}
            invoiceSum={invoiceSum}
            onChange={(property, value) =>
              handleChange(property as keyof Invoice, value)
            }
          />
        )}
      </div>

      <div className="my-4">
        {currentInvoice && (
          <InvoicePreview
            for="invoice"
            resource={currentInvoice}
            entity="invoice"
          />
        )}
      </div>
    </Default>
  );
}
