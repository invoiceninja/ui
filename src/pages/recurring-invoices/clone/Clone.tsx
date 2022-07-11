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
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useRecurringInvoiceQuery } from 'common/queries/recurring-invoices';
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
import { ValidationAlert } from 'components/ValidationAlert';
import { ClientSelector } from 'pages/invoices/common/components/ClientSelector';
import { InvoicePreview } from 'pages/invoices/common/components/InvoicePreview';
import { InvoiceTotals } from 'pages/invoices/common/components/InvoiceTotals';
import { ProductsTable } from 'pages/invoices/common/components/ProductsTable';
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

export function Clone() {
  const { documentTitle } = useTitle('new_recurring_invoice');
  const { id } = useParams();
  const { data: recurringInvoice } = useRecurringInvoiceQuery({ id });

  const [t] = useTranslation();
  const [errors, setErrors] = useState<ValidationBag>();

  const dispatch = useDispatch();
  const handleCreate = useHandleCreate(setErrors);
  const currentRecurringInvoice = useCurrentRecurringInvoice();
  const handleChange = useSetCurrentRecurringInvoiceProperty();

  const invoiceSum = useInvoiceSum();

  const pages: BreadcrumRecord[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
    {
      name: t('clone_to_recurring'),
      href: generatePath('/recurring_invoices/:id/clone', { id }),
    },
  ];

  useEffect(() => {
    if (recurringInvoice?.data.data) {
      dispatch(
        setCurrentRecurringInvoice({
          ...recurringInvoice.data.data,
          number: '',
          documents: []
        })
      );
    }
  }, [recurringInvoice]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick={generatePath('/recurring_invoices')}
      onSaveClick={() =>
        handleCreate(currentRecurringInvoice as RecurringInvoice)
      }
    >
      {errors && <ValidationAlert errors={errors} />}

      <div className="grid grid-cols-12 gap-4">
        {currentRecurringInvoice && (
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
        )}
        <InvoiceDetails />

        <div className="col-span-12">
          {currentRecurringInvoice && (
            <ProductsTable
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
          )}
        </div>

        <InvoiceFooter page="create" />

        {currentRecurringInvoice && (
          <InvoiceTotals
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
            resource={currentRecurringInvoice}
            entity="recurring_invoice"
          />
        )}
      </div>
    </Default>
  );
}
