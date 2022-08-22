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
import { useInvoiceSum } from '../common/hooks/useInvoiceSum';
import { TabGroup } from 'components/TabGroup';
import { useProductColumns } from '../common/hooks/useProductColumns';
import { useTaskColumns } from '../common/hooks/useTaskColumns';
import { InvoiceItemType } from 'common/interfaces/invoice-item';
import { uuid4 } from '@sentry/utils';
import { InvoiceTotals } from '../common/components/InvoiceTotals';
import { InvoicePreview } from '../common/components/InvoicePreview';

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

  const productColumns = useProductColumns();
  const taskColumns = useTaskColumns();

  const pages: BreadcrumRecord[] = [
    { name: t('invoices'), href: '/invoices' },
    {
      name: t('edit_invoice'),
      href: generatePath('/invoices/:id/edit', { id }),
    },
  ];

  useEffect(() => {
    if (invoice?.data.data) {
      const data: Invoice = { ...invoice.data.data };

      data.line_items.forEach((item) => (item._id = uuid4()));

      dispatch(setCurrentInvoice(data));
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
      navigationTopRight={currentInvoice && <Actions />}
      disableSaveButton={
        currentInvoice &&
        (currentInvoice.status_id === InvoiceStatus.Cancelled ||
          currentInvoice.is_deleted)
      }
    >
      <div className="grid grid-cols-12 gap-4">
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

        <InvoiceDetails />

        <div className="col-span-12">
          <TabGroup tabs={[t('products'), t('tasks')]}>
            <div>
              {currentInvoice && (
                <ProductsTable
                  type="product"
                  resource={currentInvoice}
                  columns={productColumns}
                  items={currentInvoice.line_items.filter(
                    (item) => item.type_id == InvoiceItemType.Product
                  )}
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
                      injectBlankItemIntoCurrent({
                        type: InvoiceItemType.Product,
                      })
                    )
                  }
                />
              )}
            </div>

            <div>
              {currentInvoice && (
                <ProductsTable
                  type="task"
                  resource={currentInvoice}
                  columns={taskColumns}
                  items={currentInvoice.line_items.filter(
                    (item) => item.type_id == InvoiceItemType.Task
                  )}
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
                      injectBlankItemIntoCurrent({ type: InvoiceItemType.Task })
                    )
                  }
                />
              )}
            </div>
          </TabGroup>
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
