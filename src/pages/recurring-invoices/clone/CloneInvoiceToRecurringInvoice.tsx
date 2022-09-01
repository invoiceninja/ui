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
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useInvoiceQuery } from 'common/queries/invoices';
import {
  injectBlankItemIntoCurrent,
  toggleCurrentRecurringInvoiceInvitation,
} from 'common/stores/slices/recurring-invoices';
import { deleteRecurringInvoiceItem } from 'common/stores/slices/recurring-invoices/extra-reducers/delete-recurring-invoice-item';
import { setCurrentLineItemProperty } from 'common/stores/slices/recurring-invoices/extra-reducers/set-current-line-item-property';
import { setCurrentRecurringInvoice } from 'common/stores/slices/recurring-invoices/extra-reducers/set-current-recurring-invoice';
import { setCurrentRecurringInvoiceLineItem } from 'common/stores/slices/recurring-invoices/extra-reducers/set-current-recurring-invoice-line-item';
import { BreadcrumRecord } from 'components/Breadcrumbs';
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
import { generatePath, useParams } from 'react-router-dom';
import { InvoiceDetails } from '../common/components/InvoiceDetails';
import { InvoiceFooter } from '../common/components/InvoiceFooter';
import { useCurrentRecurringInvoice } from '../common/hooks/useCurrentRecurringInvoice';
import { useInvoiceSum } from '../common/hooks/useInvoiceSum';
import { useSetCurrentRecurringInvoiceProperty } from '../common/hooks/useSetCurrentRecurringInvoiceProperty';
import { useHandleCreate } from '../create/hooks/useHandleCreate';

export function CloneInvoiceToRecurringInvoice() {
  const { documentTitle } = useTitle('clone_to_recurring');
  const { id } = useParams();
  const { data: invoice } = useInvoiceQuery({ id });

  const [t] = useTranslation();
  const [errors, setErrors] = useState<ValidationBag>();

  const dispatch = useDispatch();
  const handleCreate = useHandleCreate(setErrors);
  const currentRecurringInvoice = useCurrentRecurringInvoice();
  const handleChange = useSetCurrentRecurringInvoiceProperty();

  const invoiceSum = useInvoiceSum();
  const productColumns = useProductColumns();

  const pages: BreadcrumRecord[] = [
    { name: t('invoices'), href: '/invoices' },
    {
      name: t('clone_to_recurring'),
      href: generatePath('/invoices/:id/clone/recurring_invoice', { id }),
    },
  ];

  useEffect(() => {
    if (invoice?.data.data) {
      dispatch(
        setCurrentRecurringInvoice({
          ...invoice.data.data,
          number: '',
        })
      );
    }
  }, [invoice]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={() =>
        handleCreate(currentRecurringInvoice as RecurringInvoice)
      }
    >
      {errors && <ValidationAlert errors={errors} />}

      <div className="grid grid-cols-12 gap-4">
        <ClientSelector
          resource={currentRecurringInvoice}
          onChange={(id) => handleChange('client_id', id)}
          onClearButtonClick={() => handleChange('client_id', '')}
          onContactCheckboxChange={(contactId, value) =>
            dispatch(
              toggleCurrentRecurringInvoiceInvitation({
                contactId,
                checked: value,
              })
            )
          }
        />

        <InvoiceDetails />

        <div className="col-span-12">
          {currentRecurringInvoice ? (
            <ProductsTable
              relationType="client_id"
              type="product"
              columns={productColumns}
              items={currentRecurringInvoice.line_items.filter(
                (item) => item.type_id === InvoiceItemType.Product
              )}
              resource={currentRecurringInvoice}
              onProductChange={(index, lineItem) =>
                dispatch(
                  setCurrentRecurringInvoiceLineItem({ index, lineItem })
                )
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
                dispatch(deleteRecurringInvoiceItem(index))
              }
              onCreateItemClick={() => dispatch(injectBlankItemIntoCurrent())}
            />
          ) : (
            <Spinner />
          )}
        </div>

        <InvoiceFooter page="create" />

        {currentRecurringInvoice && (
          <InvoiceTotals
          relationType='client_id'
            resource={currentRecurringInvoice}
            invoiceSum={invoiceSum}
            onChange={(property, value) =>
              handleChange(property as keyof RecurringInvoice, value)
            }
          />
        )}
      </div>

      <div className="my-4">
        {currentRecurringInvoice && (
          <InvoicePreview
            for="invoice"
            relationType='client_id'
            resource={currentRecurringInvoice}
            entity="recurring_invoice"
          />
        )}
      </div>
    </Default>
  );
}
