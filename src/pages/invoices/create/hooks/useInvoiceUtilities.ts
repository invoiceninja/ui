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
      // When unchecking invitation, also remove can_sign property
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

  const handleContactCanSignChange = (id: string, checked: boolean) => {
    console.log('handleContactCanSignChange called:', { id, checked, hasInvoice: !!invoice, hasClient: !!invoice?.client?.contacts, hasPropsClient: !!props.client?.contacts });
    
    // Use props.client if invoice.client is not available
    const clientContacts = invoice?.client?.contacts || props.client?.contacts;
    
    if (!clientContacts) {
      console.log('No client contacts found in either invoice.client or props.client');
      return;
    }

    // Find the contact by id
    const contact = clientContacts.find(c => c.id === id);
    if (!contact) {
      console.log('Contact not found:', id);
      return;
    }

    // Check if contact is invited - if not, don't allow can_sign changes
    const isInvited = invoice.invitations?.some(inv => inv.client_contact_id === contact.id) || false;
    if (!isInvited) {
      console.log('Contact not invited, cannot change can_sign');
      return;
    }

    console.log('Contact found and invited, proceeding with update');

    // Update the invitations array with the can_sign property
    const invitations = [...(invoice.invitations || [])];
    
    // Find existing invitation for this contact
    const existingInvitationIndex = invitations.findIndex(inv => inv.client_contact_id === contact.id);
    
    console.log('Existing invitation index:', existingInvitationIndex);
    
    if (existingInvitationIndex >= 0) {
      // Update existing invitation
      const oldInvitation = invitations[existingInvitationIndex];
      invitations[existingInvitationIndex] = {
        ...invitations[existingInvitationIndex],
        can_sign: checked
      };
      console.log('Updated invitation:', { 
        old: oldInvitation, 
        new: invitations[existingInvitationIndex] 
      });
    }

    console.log('Final invitations array:', invitations);

    // Update the invoice with the modified invitations
    setInvoice((current) => 
      current && {
        ...current,
        invitations: invitations,
      }
    );
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

    if (lineItems[index][key] === value) {
      return;
    }

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
            { ...blankLineItem(), type_id: typeId, quantity: 1 },
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
    handleContactCanSignChange,
    calculateInvoiceSum,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
  };
}
