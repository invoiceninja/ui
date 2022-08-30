/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { DesignSelector } from 'common/generic/DesignSelector';
import { endpoint } from 'common/helpers';
import { InvoiceSum } from 'common/helpers/invoices/invoice-sum';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useResolveCurrency } from 'common/hooks/useResolveCurrency';
import { useTitle } from 'common/hooks/useTitle';
import { useVendorResolver } from 'common/hooks/vendors/useVendorResolver';
import { InvoiceItem } from 'common/interfaces/invoice-item';
import { Invitation, PurchaseOrder } from 'common/interfaces/purchase-order';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { usePurchaseOrderQuery } from 'common/queries/purchase-orders';
import { blankLineItem } from 'common/stores/slices/invoices/constants/blank-line-item';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { ClientSelector } from 'components/clients/ClientSelector';
import { DocumentsTable } from 'components/DocumentsTable';
import { MarkdownEditor } from 'components/forms/MarkdownEditor';
import { Default } from 'components/layouts/Default';
import { ProjectSelector } from 'components/projects/ProjectSelector';
import { Spinner } from 'components/Spinner';
import { TabGroup } from 'components/TabGroup';
import { UserSelector } from 'components/users/UserSelector';
import { cloneDeep } from 'lodash';
import { InvoicePreview } from 'pages/invoices/common/components/InvoicePreview';
import { InvoiceTotals } from 'pages/invoices/common/components/InvoiceTotals';
import { ProductsTable } from 'pages/invoices/common/components/ProductsTable';
import { useProductColumns } from 'pages/invoices/common/hooks/useProductColumns';
import { Upload } from 'pages/settings/company/documents/components';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { Details } from './components/Details';
import { VendorSelector } from './components/VendorSelector';

export function Edit() {
  const { documentTitle } = useTitle('edit_purchase_order');
  const { t } = useTranslation();
  const { id } = useParams();
  const { data } = usePurchaseOrderQuery({ id });

  const pages: BreadcrumRecord[] = [
    { name: t('purchase_orders'), href: '/purchase_orders' },
    {
      name: t('edit_purchase_order'),
      href: generatePath('/purchase_orders/:id/edit', { id }),
    },
  ];

  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder>();
  const [invoiceSum, setInvoiceSum] = useState<InvoiceSum>();
  const [errors, setErrors] = useState<ValidationBag>();

  const productColumns = useProductColumns();
  const company = useCurrentCompany();
  const queryClient = useQueryClient();

  const vendorResolver = useVendorResolver();
  const currencyResolver = useResolveCurrency();

  useEffect(() => {
    if (data) {
      const po = cloneDeep(data);

      po.line_items.forEach((item) => (item._id = v4()));

      setPurchaseOrder(po);
    }
  }, [data]);

  const handleChange = <T extends keyof PurchaseOrder>(
    property: T,
    value: PurchaseOrder[typeof property]
  ) => {
    setPurchaseOrder((current) => current && { ...current, [property]: value });
  };

  const handleInvitationChange = (id: string, checked: boolean) => {
    let invitations = [...purchaseOrder!.invitations];

    const potential =
      invitations?.find((invitation) => invitation.vendor_contact_id === id) ||
      -1;

    if (potential !== -1 && checked === false) {
      invitations = invitations.filter((i) => i.vendor_contact_id !== id);
    }

    if (potential === -1) {
      const invitation: Partial<Invitation> = {
        vendor_contact_id: '',
      };

      invitation.vendor_contact_id = id;

      invitations.push(invitation as Invitation);
    }

    handleChange('invitations', invitations);
  };

  const resolveCurrency = async (vendorId: string) => {
    const vendor = await vendorResolver.find(vendorId);

    const currency = currencyResolver(
      vendor.currency_id || company.settings.currency_id
    );

    return currency;
  };

  const recalculateInvoiceSum = async (purchaseOrder: PurchaseOrder) => {
    const currency = await resolveCurrency(purchaseOrder!.vendor_id);
    const invoiceSum = new InvoiceSum(purchaseOrder!, currency!).build();

    setInvoiceSum(invoiceSum);

    return invoiceSum.invoice as PurchaseOrder;
  };

  const handleProductChange = async (index: number, lineItem: InvoiceItem) => {
    const po = cloneDeep(purchaseOrder) as PurchaseOrder;

    po.line_items[index] = lineItem;

    setPurchaseOrder(await recalculateInvoiceSum(po));
  };

  const handleLineItemPropertyChange = async (
    property: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => {
    const po = cloneDeep(purchaseOrder) as PurchaseOrder;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    po.line_items[index][property] = value;

    setPurchaseOrder(await recalculateInvoiceSum(po));
  };

  const handleCreateLineItem = async () => {
    const po = cloneDeep(purchaseOrder) as PurchaseOrder;

    po.line_items.push(blankLineItem());

    setPurchaseOrder(po);
  };

  const handleDeleteLineItem = async (index: number) => {
    const po = cloneDeep(purchaseOrder) as PurchaseOrder;

    po.line_items.splice(index, 1);

    setPurchaseOrder(po);
  };

  const tabs = [
    t('terms'),
    t('footer'),
    t('public_notes'),
    t('private_notes'),
    t('settings'),
    t('documents'),
  ];

  const onSuccess = () => {
    queryClient.invalidateQueries(
      generatePath('/api/v1/purchase_orders/:id', { id })
    );
  };

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <div className="grid grid-cols-12 gap-4">
        <VendorSelector
          readonly
          resource={purchaseOrder}
          onChange={(id) => handleChange('vendor_id', id)}
          onClearButtonClick={() => handleChange('vendor_id', '')}
          onContactCheckboxChange={handleInvitationChange}
        />

        <Details
          purchaseOrder={purchaseOrder}
          handleChange={handleChange}
          errors={errors}
        />

        <div className="col-span-12">
          {purchaseOrder ? (
            <ProductsTable
              type="product"
              resource={purchaseOrder}
              items={purchaseOrder.line_items}
              columns={productColumns}
              relationType="vendor_id"
              onProductChange={handleProductChange}
              onSort={(lineItems) => handleChange('line_items', lineItems)}
              onLineItemPropertyChange={handleLineItemPropertyChange}
              onCreateItemClick={handleCreateLineItem}
              onDeleteRowClick={handleDeleteLineItem}
            />
          ) : (
            <Spinner />
          )}
        </div>

        <Card className="col-span-12 xl:col-span-8 h-max px-6">
          <TabGroup tabs={tabs}>
            <div>
              <MarkdownEditor
                value={purchaseOrder?.terms || ''}
                onChange={(value) => handleChange('terms', value)}
              />
            </div>

            <div>
              <MarkdownEditor
                value={purchaseOrder?.footer || ''}
                onChange={(value) => handleChange('footer', value)}
              />
            </div>

            <div>
              <MarkdownEditor
                value={purchaseOrder?.public_notes || ''}
                onChange={(value) => handleChange('public_notes', value)}
              />
            </div>

            <div>
              <MarkdownEditor
                value={purchaseOrder?.private_notes || ''}
                onChange={(value) => handleChange('private_notes', value)}
              />
            </div>

            <div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-6 space-y-6">
                  <UserSelector
                    inputLabel={t('User')}
                    value={purchaseOrder?.assigned_user_id}
                    onChange={(user) =>
                      handleChange('assigned_user_id', user.id)
                    }
                  />
                </div>

                <div className="col-span-12 lg:col-span-6 space-y-6">
                  <ProjectSelector
                    inputLabel={t('project')}
                    value={purchaseOrder?.project_id}
                    onChange={(project) =>
                      handleChange('project_id', project.id)
                    }
                  />
                </div>

                <div className="col-span-12 lg:col-span-6 space-y-6">
                  <ClientSelector
                    inputLabel={t('client')}
                    value={purchaseOrder?.client_id}
                    onChange={(client) => handleChange('client_id', client.id)}
                  />
                </div>

                <div className="col-span-12 lg:col-span-6 space-y-6">
                  <InputField
                    label={t('exchange_rate')}
                    value={purchaseOrder?.exchange_rate || 1.0}
                    onValueChange={(value) =>
                      handleChange('exchange_rate', parseFloat(value) || 1.0)
                    }
                  />
                </div>

                <div className="col-span-12 lg:col-span-6 space-y-6">
                  <DesignSelector
                    inputLabel={t('design')}
                    value={purchaseOrder?.design_id}
                    onChange={(design) => handleChange('design_id', design.id)}
                  />
                </div>
              </div>
            </div>

            <div>
              <Upload
                widgetOnly
                endpoint={endpoint('/api/v1/purchase_order/:id/upload', {
                  id,
                })}
                onSuccess={onSuccess}
              />

              <DocumentsTable
                documents={purchaseOrder?.documents || []}
                onDocumentDelete={onSuccess}
              />
            </div>
          </TabGroup>
        </Card>

        {purchaseOrder && (
          <InvoiceTotals
            relationType="vendor_id"
            resource={purchaseOrder}
            invoiceSum={invoiceSum}
            onChange={(property, value) =>
              handleChange(property as keyof PurchaseOrder, value as string)
            }
          />
        )}
      </div>

      <div className="my-4">
        {purchaseOrder && (
          <InvoicePreview
            for="invoice"
            resource={purchaseOrder}
            entity="purchase_order"
            relationType="vendor_id"
          />
        )}
      </div>
    </Default>
  );
}
