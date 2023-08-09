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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { Client } from '$app/common/interfaces/client';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import { Invitation } from '$app/common/interfaces/purchase-order';
import { blankLineItem } from '$app/common/constants/blank-line-item';
import { useAtom } from 'jotai';
import { invoiceAtom, invoiceSumAtom } from '$app/pages/invoices/common/atoms';
import { ChangeHandler } from '../Create';
import { Invoice } from '$app/common/interfaces/invoice';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';

interface Props {
  client?: Client;
}

export function useInvoiceUtilities(props: Props) {
  const [invoice, setInvoice] = useAtom(invoiceAtom);
  const [, setInvoiceSum] = useAtom(invoiceSumAtom);

  const company = useCurrentCompany();

  const currencyResolver = useResolveCurrency();

  const handleChange: ChangeHandler = (property, value) => {
    setInvoice((current) => current && { ...current, [property]: value });
  };

  const handleInvitationChange = (id: string, checked: boolean) => {
    let invitations = [...invoice!.invitations];

    const potential =
      invitations?.find((invitation) => invitation.client_contact_id === id) ||
      -1;

    if (potential !== -1 && checked === false) {
      invitations = invitations.filter((i) => i.client_contact_id !== id);
    }

    if (potential === -1) {
      const invitation: Partial<Invitation> = {
        client_contact_id: id,
      };

      invitations.push(invitation as Invitation);
    }

    handleChange('invitations', invitations);
  };

  const calculateInvoiceSum = (invoice: Invoice) => {
    const currency = currencyResolver(
      props.client?.settings.currency_id || company?.settings.currency_id
    );

    if (currency && invoice) {
      const invoiceSum = invoice.uses_inclusive_taxes
        ? new InvoiceSumInclusive(invoice, currency).build()
        : new InvoiceSum(invoice, currency).build();

      setInvoiceSum(invoiceSum);
    }
  };

  const handleLineItemChange = (index: number, lineItem: InvoiceItem) => {
    const lineItems = invoice?.line_items || [];

    lineItems[index] = lineItem;

    setInvoice((invoice) => invoice && { ...invoice, line_items: lineItems });
  };

  const handleLineItemPropertyChange = (
    key: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => {
    const lineItems = invoice?.line_items || [];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    lineItems[index][key] = value;

    setInvoice((invoice) => invoice && { ...invoice, line_items: lineItems });
  };

  const handleCreateLineItem = (typeId: InvoiceItemType) => {
    setInvoice(
      (invoice) =>
        invoice && {
          ...invoice,
          line_items: [
            ...invoice.line_items,
            { ...blankLineItem(), type_id: typeId },
          ],
        }
    );
  };

  const handleDeleteLineItem = (index: number) => {
    const lineItems = invoice?.line_items || [];

    lineItems.splice(index, 1);

    setInvoice((invoice) => invoice && { ...invoice, line_items: lineItems });
  };

  return {
    handleChange,
    handleInvitationChange,
    calculateInvoiceSum,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
  };
}
