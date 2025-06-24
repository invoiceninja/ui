/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Spinner } from '$app/components/Spinner';
import { InvoicePreview } from '$app/pages/invoices/common/components/InvoicePreview';
import { InvoiceTotals } from '$app/pages/invoices/common/components/InvoiceTotals';
import { ProductsTable } from '$app/pages/invoices/common/components/ProductsTable';
import { useProductColumns } from '$app/pages/invoices/common/hooks/useProductColumns';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { Details } from './components/Details';
import { Footer } from './components/Footer';
import { VendorSelector } from './components/VendorSelector';
import { useHandleCreateLineItem } from './hooks/useHandleCreateLineItem';
import { useHandleDeleteLineItem } from './hooks/useHandleDeleteLineItem';
import { useHandleInvitationChange } from './hooks/useHandleInvitationChange';
import { useHandleLineItemPropertyChange } from './hooks/useHandleLineItemPropertyChange';
import { useHandleProductChange } from './hooks/useHandleProductChange';
import { Card } from '$app/components/cards';
import { PurchaseOrderStatus } from '$app/pages/purchase-orders/common/components/PurchaseOrderStatus';
import { useColorScheme } from '$app/common/colors';
import { PurchaseOrderContext } from '../create/Create';

export default function Edit() {
  const [t] = useTranslation();

  const context: PurchaseOrderContext = useOutletContext();
  const {
    purchaseOrder,
    setPurchaseOrder,
    errors,
    isDefaultFooter,
    isDefaultTerms,
    setIsDefaultFooter,
    setIsDefaultTerms,
    invoiceSum,
  } = context;

  const colors = useColorScheme();
  const reactSettings = useReactSettings();
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

  const handleProductChange = useHandleProductChange(setPurchaseOrder);

  const handleLineItemPropertyChange =
    useHandleLineItemPropertyChange(setPurchaseOrder);

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
          {purchaseOrder && (
            <div className="flex space-x-20">
              <span
                className="text-sm"
                style={{
                  backgroundColor: colors.$2,
                  color: colors.$3,
                  colorScheme: colors.$0,
                }}
              >
                {t('status')}
              </span>
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
              isDefaultFooter={isDefaultFooter}
              isDefaultTerms={isDefaultTerms}
              setIsDefaultFooter={setIsDefaultFooter}
              setIsDefaultTerms={setIsDefaultTerms}
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
              withRemoveLogoCTA
              observable={true}
              initiallyVisible={false}
            />
          )}
        </div>
      )}
    </>
  );
}
