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
import { useCreditQuery } from 'common/queries/credits';
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
import { ClientSelector } from 'pages/invoices/common/components/ClientSelector';
import { InvoicePreview } from 'pages/invoices/common/components/InvoicePreview';
import { InvoiceTotals } from 'pages/invoices/common/components/InvoiceTotals';
import { ProductsTable } from 'pages/invoices/common/components/ProductsTable';
import { useProductColumns } from 'pages/invoices/common/hooks/useProductColumns';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { generatePath, useParams } from 'react-router-dom';
import { CreditDetails } from '../common/components/CreditDetails';
import { CreditFooter } from '../common/components/CreditFooter';
import { useCurrentCredit } from '../common/hooks/useCurrentCredit';
import { useHandleSave } from '../common/hooks/useHandleSave';
import { useInvoiceSum } from '../common/hooks/useInvoiceSum';
import { useSetCurrentCreditProperty } from '../common/hooks/useSetCurrentCreditProperty';
import { Actions } from './components/Actions';

export function Edit() {
  const { documentTitle } = useTitle('edit_credit');
  const { id } = useParams();
  const { data: credit } = useCreditQuery({ id });

  const [t] = useTranslation();
  const dispatch = useDispatch();
  const handleChange = useSetCurrentCreditProperty();

  const handleSave = useHandleSave();

  const currentCredit = useCurrentCredit();
  const invoiceSum = useInvoiceSum();
  const productColumns = useProductColumns();

  const pages: BreadcrumRecord[] = [
    { name: t('credits'), href: '/credits' },
    {
      name: t('edit_credit'),
      href: generatePath('/credits/:id/edit', { id }),
    },
  ];

  useEffect(() => {
    if (credit?.data.data) {
      dispatch(setCurrentCredit(credit.data.data));
    }

    return () => {
      dispatch(dismissCurrentCredit());
    };
  }, [credit]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={() =>
        handleSave(currentCredit?.id as string, currentCredit as Credit)
      }
      navigationTopRight={currentCredit && <Actions />}
    >
      <div className="grid grid-cols-12 gap-4">
          <ClientSelector
            resource={currentCredit}
            readonly
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
          {currentCredit && (
            <ProductsTable
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
