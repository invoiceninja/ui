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
import { Link, useOutletContext } from 'react-router-dom';
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
import { Badge } from '$app/components/Badge';
import { useStatusThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';

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
  const statusThemeColors = useStatusThemeColorScheme();
  const handleProductChange = useHandleProductChange(setPurchaseOrder);

  const handleLineItemPropertyChange =
    useHandleLineItemPropertyChange(setPurchaseOrder);

    const handleContactCanSignChange = (id: string, checked: boolean) => {
      if (!purchaseOrder?.vendor?.contacts) return;
  
      // Find the contact by id
      const contact = purchaseOrder.vendor.contacts.find(c => c.id === id);
      if (!contact) return;
  
      // Check if contact is invited - if not, don't allow can_sign changes
      const isInvited = purchaseOrder.invitations?.some(inv => inv.vendor_contact_id === contact.id) || false;
      if (!isInvited) return;
  
      // Update the invitations array with the can_sign property
      const invitations = [...(purchaseOrder.invitations || [])];
      
      // Find existing invitation for this contact
      const existingInvitationIndex = invitations.findIndex(inv => inv.vendor_contact_id === contact.id);
      
      if (existingInvitationIndex >= 0) {
        // Update existing invitation
        invitations[existingInvitationIndex] = {
          ...invitations[existingInvitationIndex],
          can_sign: checked
        };
      }
  
      // Update the credit with the modified invitations
      setPurchaseOrder((current) => 
        current && {
          ...current,
          invitations: invitations,
        }
      );
    };
    
  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <Card
          className="col-span-12 xl:col-span-4 h-max px-6 py-2 shadow-sm"
          style={{ borderColor: colors.$24 }}
        >
          <div className="flex flex-col space-y-4">
            {purchaseOrder && (
              <div className="flex items-center space-x-11">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$22 }}
                >
                  {t('status')}
                </span>

                <div className="flex items-center space-x-2">
                  <PurchaseOrderStatus entity={purchaseOrder} />

                  {purchaseOrder && purchaseOrder.sync?.dn_completed && purchaseOrder.sync?.invitations[0]?.dn_id && (
                    
                    <Badge variant="green" style={{ backgroundColor: statusThemeColors.$3 }}>
                      <Link
                        className="font-medium"
                        to={`/documents/${purchaseOrder.sync?.invitations[0]?.dn_id}`}
                        >
                        {t('signed_document')}
                      </Link>
                    </Badge>
                              
                  )}
                </div>
              </div>
            )}

            
            <VendorSelector
              resource={purchaseOrder}
              onChange={(id) => handleChange('vendor_id', id)}
              onClearButtonClick={() => handleChange('vendor_id', '')}
              onContactCheckboxChange={(id, checked) =>
                purchaseOrder &&
                handleInvitationChange(purchaseOrder, id, checked)
              }
              onContactCanSignCheckboxChange={(id, checked) =>handleContactCanSignChange(id, checked)}
              errorMessage={errors?.errors.vendor_id}
              readonly
            />
          </div>
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
