/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { Checkbox, InputLabel } from '@invoiceninja/forms';
import { ClientResolver } from 'common/helpers/clients/client-resolver';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { Client as ClientInterface } from 'common/interfaces/client';
import {
  setCurrentInvoiceProperty,
  toggleCurrentInvoiceInvitation,
} from 'common/stores/slices/invoices';
import { DebouncedSearch } from 'components/forms/DebouncedSearch';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { CreateClient } from './CreateClient';

export function Client() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const [client, setClient] = useState<ClientInterface>();
  const invoice = useCurrentInvoice();

  const clientResolver = new ClientResolver();

  const handleContactCheckboxChange = (contactId: string, value: boolean) => {
    dispatch(toggleCurrentInvoiceInvitation({ contactId, checked: value }));
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

          dispatch(
            setCurrentInvoiceProperty({ property: 'invitations', value: [] })
          );

          client.contacts.map((contact) => {
            if (contact.send_email) {
              handleContactCheckboxChange(contact.id, true);
            }
          });
        })
        .catch((error) => console.error(error));
    }
  }, [invoice?.client_id]);

  return (
    <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
      <div className="flex items-center justify-between">
        <InputLabel>{t('client')}</InputLabel>
        <CreateClient />
      </div>

      <DebouncedSearch
        endpoint="/api/v1/clients"
        label="display_name"
        onChange={(value) =>
          dispatch(
            setCurrentInvoiceProperty({
              property: 'client_id',
              value: value.value,
            })
          )
        }
      />

      {client &&
        client.contacts.map((contact, index) => (
          <div key={index}>
            <Checkbox
              id={contact.id}
              value={contact.id}
              label={`${contact.first_name} ${contact.last_name}`}
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
    </Card>
  );
}
