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
import { useTitle } from '$app/common/hooks/useTitle';
import {
  Invitation,
  PurchaseOrder,
} from '$app/common/interfaces/purchase-order';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
import { cloneDeep } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useSearchParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { purchaseOrderAtom } from '../common/atoms';
import { useCreate } from '../common/hooks';
import { blankInvitation } from '$app/common/constants/blank-invitation';
import { useVendorResolver } from '$app/common/hooks/vendors/useVendorResolver';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { useBlankPurchaseOrderQuery } from '$app/common/queries/purchase-orders';
import { Tab, Tabs } from '$app/components/Tabs';
import { useCalculateInvoiceSum } from '../edit/hooks/useCalculateInvoiceSum';
import { useAtomWithPrevent } from '$app/common/hooks/useAtomWithPrevent';

export interface PurchaseOrderContext {
  purchaseOrder: PurchaseOrder | undefined;
  setPurchaseOrder: Dispatch<SetStateAction<PurchaseOrder | undefined>>;
  isDefaultTerms: boolean;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
  isDefaultFooter: boolean;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
  errors: ValidationBag | undefined;
  invoiceSum: InvoiceSum | InvoiceSumInclusive | undefined;
  setInvoiceSum: Dispatch<
    SetStateAction<InvoiceSum | InvoiceSumInclusive | undefined>
  >;
}

export default function Create() {
  const { documentTitle } = useTitle('new_purchase_order');
  const [t] = useTranslation();

  const [searchParams] = useSearchParams();

  const company = useCurrentCompany();
  const vendorResolver = useVendorResolver();

  const pages: Page[] = [
    { name: t('purchase_orders'), href: '/purchase_orders' },
    {
      name: t('new_purchase_order'),
      href: '/purchase_orders/create',
    },
  ];

  const tabs: Tab[] = [
    {
      name: t('create'),
      href: '/purchase_orders/create',
    },
    {
      name: t('documents'),
      href: '/purchase_orders/create/documents',
    },
    {
      name: t('settings'),
      href: '/purchase_orders/create/settings',
    },
  ];

  const [purchaseOrder, setPurchaseOrder] =
    useAtomWithPrevent(purchaseOrderAtom);

  const { data, isLoading } = useBlankPurchaseOrderQuery({
    enabled: typeof purchaseOrder === 'undefined',
  });

  const [invoiceSum, setInvoiceSum] = useState<
    InvoiceSum | InvoiceSumInclusive
  >();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isDefaultTerms, setIsDefaultTerms] = useState<boolean>(false);
  const [isDefaultFooter, setIsDefaultFooter] = useState<boolean>(false);

  const handleChange = <T extends keyof PurchaseOrder>(
    property: T,
    value: PurchaseOrder[typeof property]
  ) => {
    setPurchaseOrder((current) => current && { ...current, [property]: value });
  };

  const calculateInvoiceSum = useCalculateInvoiceSum(setInvoiceSum);

  const onSave = useCreate({ setErrors, isDefaultTerms, isDefaultFooter });

  useEffect(() => {
    setPurchaseOrder((current) => {
      let value = current;

      if (
        searchParams.get('action') !== 'clone' &&
        searchParams.get('action') !== 'purchase_order_product'
      ) {
        value = undefined;
      }

      if (
        typeof data !== 'undefined' &&
        typeof value === 'undefined' &&
        searchParams.get('action') !== 'clone'
      ) {
        const po = cloneDeep(data);

        if (typeof po.line_items === 'string') {
          po.line_items = [];
        }

        if (searchParams.get('vendor')) {
          po.vendor_id = searchParams.get('vendor')!;
        }

        po.line_items.forEach((item) => (item._id = v4()));

        po.invitations.forEach(
          (invitation) =>
            (invitation['client_contact_id'] =
              invitation.client_contact_id || '')
        );

        po.uses_inclusive_taxes = company?.settings?.inclusive_taxes ?? false;

        value = po;
      }

      return value;
    });

    return () => {
      setPurchaseOrder(undefined);
    };
  }, [data]);

  useEffect(() => {
    purchaseOrder &&
      purchaseOrder.vendor_id &&
      vendorResolver.find(purchaseOrder.vendor_id).then((vendor) => {
        const invitations: Invitation[] = [];

        vendor.contacts.map((contact) => {
          if (contact.send_email) {
            const invitation = cloneDeep(
              blankInvitation
            ) as unknown as Invitation;

            invitation.vendor_contact_id = contact.id;
            invitations.push(invitation);
          }
        });

        handleChange('invitations', invitations);
      });
  }, [purchaseOrder?.vendor_id]);

  useEffect(() => {
    purchaseOrder && calculateInvoiceSum(purchaseOrder);
  }, [purchaseOrder]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={() => purchaseOrder && onSave(purchaseOrder)}
    >
      {!isLoading ? (
        <div className="space-y-4">
          <Tabs tabs={tabs} />

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
    </Default>
  );
}
