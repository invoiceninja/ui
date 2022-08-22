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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { generatePath, useParams } from 'react-router-dom';
import { ClientSelector } from '../common/components/ClientSelector';
import { InvoiceFooter } from '../common/components/InvoiceFooter';
import { InvoiceDetails } from '../common/components/InvoiceDetails';
import { ProductsTable } from '../common/components/ProductsTable';
import { InvoiceTotals } from '../common/components/InvoiceTotals';
import { setCurrentInvoice } from 'common/stores/slices/invoices/extra-reducers/set-current-invoice';
import { InvoicePreview } from '../common/components/InvoicePreview';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { Invoice } from 'common/interfaces/invoice';
import { useHandleCreate } from '../create/hooks/useHandleCreate';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { ValidationAlert } from 'components/ValidationAlert';
import { useSetCurrentInvoiceProperty } from '../common/hooks/useSetCurrentInvoiceProperty';
import {
  dismissCurrentInvoice,
  injectBlankItemIntoCurrent,
  toggleCurrentInvoiceInvitation,
} from 'common/stores/slices/invoices';
import { setCurrentInvoiceLineItem } from 'common/stores/slices/invoices/extra-reducers/set-current-invoice-line-item';
import { setCurrentLineItemProperty } from 'common/stores/slices/invoices/extra-reducers/set-current-line-item-property';
import { deleteInvoiceLineItem } from 'common/stores/slices/invoices/extra-reducers/delete-invoice-item';
import { useInvoiceSum } from '../common/hooks/useInvoiceSum';
import { useProductColumns } from '../common/hooks/useProductColumns';
import { TabGroup } from 'components/TabGroup';
import { InvoiceItemType } from 'common/interfaces/invoice-item';
import { useTaskColumns } from '../common/hooks/useTaskColumns';
import { Spinner } from 'components/Spinner';

export function Clone() {
  const { documentTitle } = useTitle('new_invoice');
  const { id } = useParams();
  const { data: invoice } = useInvoiceQuery({ id });
  const [t] = useTranslation();

  const [errors, setErrors] = useState<ValidationBag>();

  const dispatch = useDispatch();
  const handleCreate = useHandleCreate(setErrors);
  const handleChange = useSetCurrentInvoiceProperty();
  const invoiceSum = useInvoiceSum();

  const currentInvoice = useCurrentInvoice();
  const productColumns = useProductColumns();
  const taskColumns = useTaskColumns();

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
          <TabGroup tabs={[t('products'), t('tasks')]}>
            <div>
              {currentInvoice ? (
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
              ) : (
                <Spinner />
              )}
            </div>

            <div>
              {currentInvoice ? (
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
              ) : (
                <Spinner />
              )}
            </div>
          </TabGroup>
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
