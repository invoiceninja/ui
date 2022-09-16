/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from "common/interfaces/client";
import { Invitation } from "common/interfaces/purchase-order";
import { RecurringInvoice } from "common/interfaces/recurring-invoice";
import { useAtom } from "jotai";
import { recurringInvoiceAtom } from "./atoms";

interface RecurringInvoiceUtilitiesProps {
  client?: Client;
}

export type ChangeHandler = <T extends keyof RecurringInvoice>(
  property: T,
  value: RecurringInvoice[typeof property],
) => void;

export function useRecurringInvoiceUtilities(
  props: RecurringInvoiceUtilitiesProps,
) {
  const [recurringInvoice, setRecurringInvoice] = useAtom(recurringInvoiceAtom);

  const handleChange: ChangeHandler = (property, value) => {
    setRecurringInvoice((current) =>
      current && { ...current, [property]: value }
    );
  };

  const handleInvitationChange = (id: string, checked: boolean) => {
    let invitations = [...recurringInvoice!.invitations];

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

    handleChange("invitations", invitations);
  };

  return { handleChange, handleInvitationChange };
}
