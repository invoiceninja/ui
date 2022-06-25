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
import { useInvoiceQuery } from 'common/queries/invoices';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { generatePath, useParams } from 'react-router-dom';
import { ClientSelector } from '../common/components/ClientSelector';
import { InvoiceFooter } from '../common/components/InvoiceFooter';
import { InvoiceDetails } from '../common/components/InvoiceDetails';
import { ProductsTable } from '../common/components/ProductsTable';
import { setCurrentInvoice } from 'common/stores/slices/invoices/extra-reducers/set-current-invoice';
import { InvoicePreview } from '../common/components/InvoicePreview';
import { useInvoiceSave } from './hooks/useInvoiceSave';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { Invoice } from 'common/interfaces/invoice';
import { Actions } from './components/Actions';
import { InvoiceStatus } from 'common/enums/invoice-status';
import {
  dismissCurrentInvoice,
  injectBlankItemIntoCurrent,
  toggleCurrentInvoiceInvitation,
} from 'common/stores/slices/invoices';
import { useSetCurrentInvoiceProperty } from '../common/hooks/useSetCurrentInvoiceProperty';
import { setCurrentInvoiceLineItem } from 'common/stores/slices/invoices/extra-reducers/set-current-invoice-line-item';
import { setCurrentLineItemProperty } from 'common/stores/slices/invoices/extra-reducers/set-current-line-item-property';
import { deleteInvoiceLineItem } from 'common/stores/slices/invoices/extra-reducers/delete-invoice-item';
import { InvoiceTotals } from '../common/components/InvoiceTotals';
import { useInvoiceSum } from '../common/hooks/useInvoiceSum';

export function Edit() {
  const { id } = useParams();
  const { documentTitle } = useTitle('edit_invoice');
  const { data: invoice } = useInvoiceQuery({ id });

  const [t] = useTranslation();

  const dispatch = useDispatch();
  const currentInvoice = useCurrentInvoice();

  const handleInvoiceSave = useInvoiceSave();
  const handleChange = useSetCurrentInvoiceProperty();

  const invoiceSum = useInvoiceSum();

  const pages: BreadcrumRecord[] = [
    { name: t('invoices'), href: '/invoices' },
    {
      name: t('edit_invoice'),
      href: generatePath('/invoices/:id/edit', { id }),
    },
  ];

  useEffect(() => {
    if (invoice?.data.data) {
      dispatch(setCurrentInvoice(invoice.data.data));
    }

    return () => {
      dispatch(dismissCurrentInvoice());
    };
  }, [invoice]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={() =>
        handleInvoiceSave(
          currentInvoice?.id as string,
          currentInvoice as Invoice
        )
      }
      navigationTopRight={
        currentInvoice &&
        currentInvoice.status_id !== InvoiceStatus.Cancelled &&
        !currentInvoice.is_deleted && <Actions />
      }
      disableSaveButton={
        currentInvoice &&
        (currentInvoice.status_id === InvoiceStatus.Cancelled ||
          currentInvoice.is_deleted)
      }
    >
      <div className="grid grid-cols-12 gap-4">
        {currentInvoice && (
          <ClientSelector
            resource={currentInvoice}
            readonly
            onChange={(id) => handleChange('client_id', id)}
            onClearButtonClick={() => handleChange('client_id', '')}
            onContactCheckboxChange={(contactId, value) =>
              dispatch(
                toggleCurrentInvoiceInvitation({ contactId, checked: value })
              )
            }
          />
        )}

        <InvoiceDetails />

        <div className="col-span-12">
          {currentInvoice && (
            <ProductsTable
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
              onCreateItemClick={() => dispatch(injectBlankItemIntoCurrent())}
            />
          )}
        </div>

        <InvoiceFooter page="edit" />

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
