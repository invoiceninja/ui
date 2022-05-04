/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Checkbox } from '@invoiceninja/forms';
import { ClientResolver } from 'common/helpers/clients/client-resolver';
import { useCurrentRecurringInvoice } from 'common/hooks/useCurrentRecurringInvoice';
import { Client } from 'common/interfaces/client';
import { blankInvitation } from 'common/stores/slices/invoices/constants/blank-invitation';
import { toggleCurrentRecurringInvoiceInvitation } from 'common/stores/slices/recurring-invoices';
import { cloneDeep } from 'lodash';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export function ClientContactSelector() {
  const [client, setClient] = useState<Client>();
  const invoice = useCurrentRecurringInvoice();
  const clientResolver = new ClientResolver();
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleContactCheckboxChange = (contactId: string, value: boolean) => {
    dispatch(
      toggleCurrentRecurringInvoiceInvitation({ contactId, checked: value })
    );
  };

  const handleCheckedState = (contactId: string) => {
    const potential = invoice?.invitations.find(
      (i) => i.client_contact_id === contactId
    );

    return Boolean(potential);
  };

  useEffect(() => {
    if (invoice?.client_id) {
      clientResolver
        .find(invoice.client_id)
        .then((client) => {
          setClient(client);

          const invitations: Record<string, unknown>[] = [];

          client.contacts.map((contact) => {
            if (contact.send_email) {
              const invitation = cloneDeep(blankInvitation);

              invitation.client_contact_id = contact.id;
              invitations.push(invitation);
            }
          });
        })
        .catch((error) => console.error(error));
    }
  }, [invoice?.client_id]);

  return (
    <>
      {invoice?.client_id &&
        client &&
        client.contacts.map((contact, index) => (
          <div key={index}>
            <Checkbox
              id={contact.id}
              value={contact.id}
              label={
                contact.first_name.length >= 1
                  ? `${contact.first_name} ${contact.last_name}`
                  : t('blank_contact')
              }
              checked={handleCheckedState(contact.id)}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleContactCheckboxChange(
                  event.target.value,
                  event.target.checked
                )
              }
            />

            <span className="text-sm text-gray-700">{contact.email}</span>
          </div>
        ))}
    </>
  );
}
