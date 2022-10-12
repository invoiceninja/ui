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
import { Checkbox, Link } from '@invoiceninja/forms';
import { useClientResolver } from 'common/hooks/clients/useClientResolver';
import { Client } from 'common/interfaces/client';
import { Invoice } from 'common/interfaces/invoice';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientSelector as Selector } from 'components/clients/ClientSelector';
import { route } from 'common/helpers/route';

interface Props {
  readonly?: boolean;
  resource?: Invoice | RecurringInvoice;
  onChange: (id: string) => unknown;
  onClearButtonClick: () => unknown;
  onContactCheckboxChange: (contactId: string, value: boolean) => unknown;
  errorMessage?: string | string[];
}

export function ClientSelector(props: Props) {
  const [t] = useTranslation();
  const [client, setClient] = useState<Client>();

  const resource = props.resource;

  const clientResolver = useClientResolver();

  const handleCheckedState = (contactId: string) => {
    const potential = resource?.invitations.find(
      (i) => i.client_contact_id === contactId
    );

    return Boolean(potential);
  };

  useEffect(() => {
    resource?.client_id &&
      clientResolver
        .find(resource.client_id)
        .then((client) => setClient(client));
  }, [resource?.client_id]);

  return (
    <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
      <div className="flex  flex-col justify-between space-y-2">
        <Selector
          inputLabel={t('client')}
          onChange={(client) => props.onChange(client.id)}
          value={resource?.client_id}
          readonly={props.readonly}
          clearButton={Boolean(resource?.client_id)}
          onClearButtonClick={props.onClearButtonClick}
          initiallyVisible={!resource?.client_id}
          errorMessage={props.errorMessage}
        />

        {client && (
          <div className="space-x-2">
            <Link to={route('/clients/:id/edit', { id: client.id })}>
              {t('edit_client')}
            </Link>
            
            <span className="text-sm text-gray-800">/</span>

            <Link to={route('/clients/:id', { id: client.id })}>
              {t('view_client')}
            </Link>
          </div>
        )}
      </div>

      {resource?.client_id &&
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
                props.onContactCheckboxChange(
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
