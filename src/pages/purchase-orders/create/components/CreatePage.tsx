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
import { useOutletContext } from 'react-router-dom';
import { Details } from '../../edit/components/Details';
import { Footer } from '../../edit/components/Footer';
import { VendorSelector } from '../../edit/components/VendorSelector';
import { Card } from '$app/components/cards';
import { PurchaseOrderContext } from '../Create';
import { useColorScheme } from '$app/common/colors';
import { usePurchaseOrderUtilities } from '../../edit/hooks/usePurchaseOrderUtilities';

export default function Create() {
  const colors = useColorScheme();
  const reactSettings = useReactSettings();

  const context: PurchaseOrderContext = useOutletContext();
  const {
    purchaseOrder,
    setPurchaseOrder,
    errors,
    invoiceSum,
    isDefaultFooter,
    setIsDefaultFooter,
    isDefaultTerms,
    setIsDefaultTerms,
  } = context;

  const productColumns = useProductColumns();

  const {
    handleChange,
    handleInvitationChange,
    handleCreateLineItem,
    handleDeleteLineItem,
    handleProductChange,
    handleLineItemPropertyChange,
  } = usePurchaseOrderUtilities({ purchaseOrder, setPurchaseOrder });

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <Card
          className="col-span-12 xl:col-span-4 h-max shadow-sm"
          withContainer
          style={{ borderColor: colors.$24 }}
        >
          <VendorSelector
            resource={purchaseOrder}
            onChange={(id) => handleChange('vendor_id', id)}
            onClearButtonClick={() => handleChange('vendor_id', '')}
            onContactCheckboxChange={(id, checked) =>
              purchaseOrder &&
              handleInvitationChange(purchaseOrder, id, checked)
            }
            initiallyVisible
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
              for="create"
              resource={purchaseOrder}
              entity="purchase_order"
              relationType="vendor_id"
              endpoint="/api/v1/live_preview/purchase_order?entity=:entity"
              observable={true}
              initiallyVisible={false}
            />
          )}
        </div>
      )}
    </>
  );
}
