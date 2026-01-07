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
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import {
  Invitation,
  PurchaseOrder,
} from '$app/common/interfaces/purchase-order';
import { blankLineItem } from '$app/common/constants/blank-line-item';
import { cloneDeep, set } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { useResolveCurrency } from './useResolveCurrency';

interface Props {
  purchaseOrder: PurchaseOrder | undefined;
  setPurchaseOrder: Dispatch<SetStateAction<PurchaseOrder | undefined>>;
  setInvoiceSum?: Dispatch<
    SetStateAction<InvoiceSum | InvoiceSumInclusive | undefined>
  >;
}

export function usePurchaseOrderUtilities({
  purchaseOrder,
  setPurchaseOrder,
  setInvoiceSum,
}: Props) {
  const company = useCurrentCompany();
  const resolveCurrency = useResolveCurrency();

  const handleChange = <T extends keyof PurchaseOrder>(
    property: T,
    value: PurchaseOrder[T]
  ) => {
    setPurchaseOrder((current) => current && { ...current, [property]: value });
  };

  const handleInvitationChange = (
    purchaseOrder: PurchaseOrder,
    id: string,
    checked: boolean
  ) => {
    let invitations = [...purchaseOrder.invitations];

    const potential =
      invitations?.find((invitation) => invitation.vendor_contact_id === id) ||
      -1;

    if (potential !== -1 && checked === false) {
      invitations = invitations.filter((i) => i.vendor_contact_id !== id);
    }

    if (potential === -1) {
      const invitation: Partial<Invitation> = {
        vendor_contact_id: '',
        client_contact_id: '',
      };

      invitation.vendor_contact_id = id;

      invitations.push(invitation as Invitation);
    }

    handleChange('invitations', invitations);
  };

  const calculateInvoiceSum = async (purchaseOrder: PurchaseOrder) => {
    const currency = await resolveCurrency(purchaseOrder.vendor_id);
    const eInvoiceType = company?.settings.e_invoice_type;

    const invoiceSum = purchaseOrder.uses_inclusive_taxes
      ? new InvoiceSumInclusive(purchaseOrder, currency!, eInvoiceType).build()
      : new InvoiceSum(purchaseOrder, currency!, eInvoiceType).build();

    if (setInvoiceSum) {
      setInvoiceSum(invoiceSum);
    }

    return invoiceSum.invoice as PurchaseOrder;
  };

  const handleLineItemChange = (
    purchaseOrder: PurchaseOrder,
    index: number,
    lineItem: InvoiceItem
  ) => {
    const updatedPurchaseOrder = cloneDeep(purchaseOrder) as PurchaseOrder;

    set(updatedPurchaseOrder, `line_items.${index}`, lineItem);

    setPurchaseOrder(updatedPurchaseOrder);
  };

  const handleLineItemPropertyChange = (
    purchaseOrder: PurchaseOrder,
    property: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => {
    const updatedPurchaseOrder = cloneDeep(purchaseOrder) as PurchaseOrder;

    if (updatedPurchaseOrder.line_items[index][property] === value) {
      return;
    }

    set(updatedPurchaseOrder, `line_items.${index}.${property}`, value);

    setPurchaseOrder(updatedPurchaseOrder);
  };

  const handleCreateLineItem = (purchaseOrder: PurchaseOrder) => {
    const po = cloneDeep(purchaseOrder) as PurchaseOrder;

    po.line_items.push({ ...blankLineItem(), quantity: 1 });

    setPurchaseOrder(po);
  };

  const handleDeleteLineItem = (
    purchaseOrder: PurchaseOrder,
    index: number
  ) => {
    const po = cloneDeep(purchaseOrder);

    po.line_items.splice(index, 1);

    setPurchaseOrder(po);
  };

  const handleProductChange = (
    purchaseOrder: PurchaseOrder,
    index: number,
    lineItem: InvoiceItem
  ) => {
    if (!purchaseOrder) return;

    const updatedPurchaseOrder = cloneDeep(purchaseOrder) as PurchaseOrder;

    set(updatedPurchaseOrder, `line_items.${index}`, lineItem);

    setPurchaseOrder(updatedPurchaseOrder);
  };

  return {
    handleChange,
    handleInvitationChange,
    calculateInvoiceSum,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
    handleProductChange,
  };
}
