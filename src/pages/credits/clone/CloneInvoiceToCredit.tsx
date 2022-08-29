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
import { Credit } from 'common/interfaces/credit';
import { InvoiceItemType } from 'common/interfaces/invoice-item';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useInvoiceQuery } from 'common/queries/invoices';
import {
  dismissCurrentCredit,
  injectBlankItemIntoCurrent,
  toggleCurrentCreditInvitation,
} from 'common/stores/slices/credits';
import { deleteCreditLineItem } from 'common/stores/slices/credits/extra-reducers/delete-credit-line-item';
import { setCurrentCredit } from 'common/stores/slices/credits/extra-reducers/set-current-credit';
import { setCurrentCreditLineItem } from 'common/stores/slices/credits/extra-reducers/set-current-credit-line-item';
import { setCurrentLineItemProperty } from 'common/stores/slices/credits/extra-reducers/set-current-line-item-property';
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
import { CreditDetails } from '../common/components/CreditDetails';
import { CreditFooter } from '../common/components/CreditFooter';
import { useCurrentCredit } from '../common/hooks/useCurrentCredit';
import { useHandleCreate } from '../common/hooks/useHandleCreate';
import { useInvoiceSum } from '../common/hooks/useInvoiceSum';
import { useSetCurrentCreditProperty } from '../common/hooks/useSetCurrentCreditProperty';

export function CloneInvoiceToCredit() {
  const { documentTitle } = useTitle('clone_to_credit');
  const { id } = useParams();
  const { data: invoice } = useInvoiceQuery({ id });

  const [errors, setErrors] = useState<ValidationBag>();

  const [t] = useTranslation();
  const dispatch = useDispatch();
  const handleChange = useSetCurrentCreditProperty();

  const handleSave = useHandleCreate(setErrors);

  const currentCredit = useCurrentCredit();
  const invoiceSum = useInvoiceSum();

  const productColumns = useProductColumns();

  const pages: BreadcrumRecord[] = [
    { name: t('invoices'), href: '/invoices' },
    {
      name: t('clone_to_credit'),
      href: generatePath('/invoices/:id/clone/credit', { id }),
    },
  ];

  useEffect(() => {
    if (invoice?.data.data) {
      dispatch(
        setCurrentCredit({ ...invoice.data.data, documents: [], number: '' })
      );
    }

    return () => {
      dispatch(dismissCurrentCredit());
    };
  }, [invoice]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={() => handleSave(currentCredit as Credit)}
    >
      {errors && <ValidationAlert errors={errors} />}

      <div className="grid grid-cols-12 gap-4">
        <ClientSelector
          resource={currentCredit}
          onChange={(id) => handleChange('client_id', id)}
          onClearButtonClick={() => handleChange('client_id', '')}
          onContactCheckboxChange={(contactId, value) =>
            dispatch(
              toggleCurrentCreditInvitation({ contactId, checked: value })
            )
          }
        />

        <CreditDetails />

        <div className="col-span-12">
          {currentCredit ? (
            <ProductsTable
              relationType="client_id"
              type="product"
              columns={productColumns}
              items={currentCredit.line_items.filter(
                (item) => item.type_id === InvoiceItemType.Product
              )}
              resource={currentCredit}
              onProductChange={(index, lineItem) =>
                dispatch(setCurrentCreditLineItem({ index, lineItem }))
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
                dispatch(deleteCreditLineItem(index))
              }
              onCreateItemClick={() => dispatch(injectBlankItemIntoCurrent())}
            />
          ) : (
            <Spinner />
          )}
        </div>

        <CreditFooter page="edit" />

        {currentCredit && (
          <InvoiceTotals
            resource={currentCredit}
            invoiceSum={invoiceSum}
            onChange={(property, value) =>
              handleChange(property as keyof Credit, value)
            }
          />
        )}
      </div>

      <div className="my-4">
        {currentCredit && (
          <InvoicePreview
            for="invoice"
            resource={currentCredit}
            entity="credit"
          />
        )}
      </div>
    </Default>
  );
}
