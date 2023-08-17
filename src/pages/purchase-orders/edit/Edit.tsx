/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import { route } from '$app/common/helpers/route';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useTitle } from '$app/common/hooks/useTitle';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { cloneDeep } from 'lodash';
import { InvoicePreview } from '$app/pages/invoices/common/components/InvoicePreview';
import { InvoiceTotals } from '$app/pages/invoices/common/components/InvoiceTotals';
import { ProductsTable } from '$app/pages/invoices/common/components/ProductsTable';
import { useProductColumns } from '$app/pages/invoices/common/hooks/useProductColumns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { useActions } from '../common/hooks';
import { usePurchaseOrderQuery } from '../common/queries';
import { Details } from './components/Details';
import { Footer } from './components/Footer';
import { VendorSelector } from './components/VendorSelector';
import { useHandleCreateLineItem } from './hooks/useHandleCreateLineItem';
import { useHandleDeleteLineItem } from './hooks/useHandleDeleteLineItem';
import { useHandleInvitationChange } from './hooks/useHandleInvitationChange';
import { useHandleLineItemPropertyChange } from './hooks/useHandleLineItemPropertyChange';
import { useHandleProductChange } from './hooks/useHandleProductChange';
import { useSave } from './hooks/useSave';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { Card } from '$app/components/cards';
import { PurchaseOrderStatus } from '$app/pages/purchase-orders/common/components/PurchaseOrderStatus';

export default function Edit() {
  const { documentTitle } = useTitle('edit_purchase_order');
  const { t } = useTranslation();
  const { id } = useParams();
  const { data } = usePurchaseOrderQuery({ id });

  const reactSettings = useReactSettings();

  const pages: Page[] = [
    { name: t('purchase_orders'), href: '/purchase_orders' },
    {
      name: t('edit_purchase_order'),
      href: route('/purchase_orders/:id/edit', { id }),
    },
  ];

  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder>();

  useEffect(() => {
    if (data) {
      const po = cloneDeep(data);

      po.line_items.forEach((item) => (item._id = v4()));

      po.invitations.forEach(
        (invitation) =>
          (invitation['client_contact_id'] = invitation.client_contact_id || '')
      );

      setPurchaseOrder(po);
    }
  }, [data]);

  const [invoiceSum, setInvoiceSum] = useState<
    InvoiceSum | InvoiceSumInclusive
  >();
  const [errors, setErrors] = useState<ValidationBag>();

  const productColumns = useProductColumns();

  const handleChange = <T extends keyof PurchaseOrder>(
    property: T,
    value: PurchaseOrder[typeof property]
  ) => {
    setPurchaseOrder((current) => current && { ...current, [property]: value });
  };

  const handleInvitationChange = useHandleInvitationChange(handleChange);
  const handleCreateLineItem = useHandleCreateLineItem(setPurchaseOrder);
  const handleDeleteLineItem = useHandleDeleteLineItem(setPurchaseOrder);

  const handleProductChange = useHandleProductChange(
    setPurchaseOrder,
    setInvoiceSum
  );

  const handleLineItemPropertyChange = useHandleLineItemPropertyChange(
    setPurchaseOrder,
    setInvoiceSum
  );

  const onSave = useSave(setErrors);

  const actions = useActions();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={() => purchaseOrder && onSave(purchaseOrder)}
      navigationTopRight={
        purchaseOrder && (
          <ResourceActions
            label={t('more_actions')}
            resource={purchaseOrder}
            actions={actions}
          />
        )
      }
    >
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
          {purchaseOrder && (
            <div className="flex space-x-20">
              <span className="text-sm text-gray-900">{t('status')}</span>
              <PurchaseOrderStatus entity={purchaseOrder} />
            </div>
          )}

          <VendorSelector
            readonly
            resource={purchaseOrder}
            onChange={(id) => handleChange('vendor_id', id)}
            onClearButtonClick={() => handleChange('vendor_id', '')}
            onContactCheckboxChange={(id, checked) =>
              purchaseOrder &&
              handleInvitationChange(purchaseOrder, id, checked)
            }
            errorMessage={errors?.errors.vendor_id}
          />
        </Card>

        {purchaseOrder && (
          <Details
            purchaseOrder={purchaseOrder}
            handleChange={handleChange}
            errors={errors}
          />
        )}

        <div className="col-span-12">
          {purchaseOrder ? (
            <ProductsTable
              type="product"
              resource={purchaseOrder}
              items={purchaseOrder.line_items}
              columns={productColumns}
              relationType="vendor_id"
              onLineItemChange={(index, lineItem) =>
                handleProductChange(purchaseOrder, index, lineItem)
              }
              onSort={(lineItems) => handleChange('line_items', lineItems)}
              onLineItemPropertyChange={(key, value, index) =>
                handleLineItemPropertyChange(purchaseOrder, key, value, index)
              }
              onCreateItemClick={() => handleCreateLineItem(purchaseOrder)}
              onDeleteRowClick={(index) =>
                handleDeleteLineItem(purchaseOrder, index)
              }
            />
          ) : (
            <Spinner />
          )}
        </div>

        {purchaseOrder && (
          <>
            <Footer
              purchaseOrder={purchaseOrder}
              handleChange={handleChange}
              errors={errors}
            />

            <InvoiceTotals
              relationType="vendor_id"
              resource={purchaseOrder}
              invoiceSum={invoiceSum}
              onChange={(property, value) =>
                handleChange(property as keyof PurchaseOrder, value as string)
              }
            />
          </>
        )}
      </div>

      {reactSettings?.show_pdf_preview && (
        <div className="my-4">
          {purchaseOrder && (
            <InvoicePreview
              for="invoice"
              resource={purchaseOrder}
              entity="purchase_order"
              relationType="vendor_id"
              endpoint="/api/v1/live_preview/purchase_order?entity=:entity"
            />
          )}
        </div>
      )}
    </Default>
  );
}
