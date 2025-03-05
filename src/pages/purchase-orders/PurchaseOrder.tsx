/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { useTitle } from '$app/common/hooks/useTitle';
import { PurchaseOrder as PurchaseOrderType } from '$app/common/interfaces/purchase-order';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams, useSearchParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { useActions } from './common/hooks';
import { useSave } from './edit/hooks/useSave';
import { usePurchaseOrderQuery } from '$app/common/queries/purchase-orders';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { Tabs } from '$app/components/Tabs';
import { useTabs } from './edit/hooks/useTabs';
import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { useCalculateInvoiceSum } from './edit/hooks/useCalculateInvoiceSum';
import { CommonActions } from '../invoices/edit/components/CommonActions';
import { PreviousNextNavigation } from '$app/components/PreviousNextNavigation';
import { useAtomWithPrevent } from '$app/common/hooks/useAtomWithPrevent';
import { purchaseOrderAtom } from './common/atoms';

export default function PurchaseOrder() {
  const { documentTitle } = useTitle('edit_purchase_order');
  const [t] = useTranslation();

  const [searchParams] = useSearchParams();

  const { id } = useParams();
  const { data } = usePurchaseOrderQuery({ id });

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const pages: Page[] = [
    { name: t('purchase_orders'), href: '/purchase_orders' },
    {
      name: t('edit_purchase_order'),
      href: route('/purchase_orders/:id/edit', { id }),
    },
  ];

  const [errors, setErrors] = useState<ValidationBag>();
  const [invoiceSum, setInvoiceSum] = useState<
    InvoiceSum | InvoiceSumInclusive
  >();
  const [isDefaultTerms, setIsDefaultTerms] = useState<boolean>(false);
  const [isDefaultFooter, setIsDefaultFooter] = useState<boolean>(false);
  const [purchaseOrder, setPurchaseOrder] =
    useAtomWithPrevent(purchaseOrderAtom);

  const actions = useActions();
  const tabs = useTabs({ purchaseOrder });

  const calculateInvoiceSum = useCalculateInvoiceSum(setInvoiceSum);

  const onSave = useSave({ setErrors, isDefaultTerms, isDefaultFooter });

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  useEffect(() => {
    const isAnyAction = searchParams.get('action');

    const currentPurchaseOrder =
      isAnyAction && purchaseOrder ? purchaseOrder : data;

    if (currentPurchaseOrder) {
      const _purchaseOrder = cloneDeep(currentPurchaseOrder);

      _purchaseOrder.line_items.forEach((item) => (item._id = v4()));

      _purchaseOrder.invitations.forEach(
        (invitation) =>
          (invitation['client_contact_id'] = invitation.client_contact_id || '')
      );

      setPurchaseOrder(_purchaseOrder);
    }
  }, [data]);

  useEffect(() => {
    purchaseOrder && calculateInvoiceSum(purchaseOrder);
  }, [purchaseOrder]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      {...((hasPermission('edit_purchase_order') ||
        entityAssigned(purchaseOrder)) &&
        purchaseOrder && {
          navigationTopRight: (
            <ResourceActions
              resource={purchaseOrder}
              onSaveClick={() => onSave(purchaseOrder)}
              actions={actions}
              cypressRef="purchaseOrderActionDropdown"
            />
          ),
        })}
      afterBreadcrumbs={<PreviousNextNavigation entity="purchase_order" />}
    >
      {purchaseOrder?.id === id ? (
        <div className="space-y-4">
          <Tabs
            tabs={tabs}
            rightSide={
              purchaseOrder && (
                <div className="flex items-center">
                  <CommonActions
                    resource={purchaseOrder}
                    entity="purchase_order"
                  />
                </div>
              )
            }
          />

          <Outlet
            context={{
              purchaseOrder,
              setPurchaseOrder,
              errors,
              isDefaultTerms,
              setIsDefaultTerms,
              isDefaultFooter,
              setIsDefaultFooter,
              invoiceSum,
              setInvoiceSum,
            }}
          />
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      )}

      <ChangeTemplateModal<PurchaseOrderType>
        entity="purchase_order"
        entities={changeTemplateResources as PurchaseOrderType[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(purchase_order) => `${t('number')}: ${purchase_order.number}`}
        bulkUrl="/api/v1/purchase_orders/bulk"
      />
    </Default>
  );
}
