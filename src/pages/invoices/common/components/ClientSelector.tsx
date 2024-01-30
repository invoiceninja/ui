/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Checkbox, Link } from '$app/components/forms';
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { Client } from '$app/common/interfaces/client';
import { Invoice } from '$app/common/interfaces/invoice';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientSelector as Selector } from '$app/components/clients/ClientSelector';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { CopyToClipboardIconOnly } from '$app/components/CopyToClipBoardIconOnly';
import { useColorScheme } from '$app/common/colors';
import { UserUnsubscribedTooltip } from '$app/pages/clients/common/components/UserUnsubscribedTooltip';

interface Props {
  readonly?: boolean;
  resource?: Invoice | RecurringInvoice;
  onChange: (id: string) => unknown;
  onClearButtonClick: () => unknown;
  onContactCheckboxChange: (contactId: string, value: boolean) => unknown;
  errorMessage?: string | string[];
  disableWithSpinner?: boolean;
  textOnly?: boolean;
}

export function ClientSelector(props: Props) {
  const [t] = useTranslation();
  const [client, setClient] = useState<Client>();

  const hasPermission = useHasPermission();

  const { resource } = props;

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

  const colors = useColorScheme();

  return (
    <>
      <div
        className="flex  flex-col justify-between space-y-2"
        style={{ color: colors.$3 }}
      >
        {props.textOnly ? (
          <p className="text-sm">{resource?.client?.display_name}</p>
        ) : (
          <Selector
            inputLabel={t('client')}
            onChange={(client) => props.onChange(client.id)}
            value={resource?.client_id}
            readonly={props.readonly || !resource}
            clearButton={Boolean(resource?.client_id)}
            onClearButtonClick={props.onClearButtonClick}
            initiallyVisible={!resource?.client_id}
            errorMessage={props.errorMessage}
            disableWithSpinner={props.disableWithSpinner}
          />
        )}

        {client && (
          <div className="space-x-2">
            {hasPermission('edit_client') && (
              <Link to={route('/clients/:id/edit', { id: client.id })}>
                {t('edit_client')}
              </Link>
            )}

            {hasPermission('edit_client') && <span className="text-sm">/</span>}

            {(hasPermission('view_client') || hasPermission('edit_client')) && (
              <Link to={route('/clients/:id', { id: client.id })}>
                {t('view_client')}
              </Link>
            )}
          </div>
        )}
      </div>

      {resource?.client_id &&
        client &&
        client.contacts.map((contact, index) => (
          <div key={index} className="flex justify-between items-center">
            <div>
              <Checkbox
                id={contact.id}
                value={contact.id}
                label={
                  contact.first_name.length >= 1
                    ? `${contact.first_name} ${contact.last_name}`
                    : contact.email || client.display_name
                }
                checked={handleCheckedState(contact.id)}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  props.onContactCheckboxChange(
                    event.target.value,
                    event.target.checked
                  )
                }
              />

              <div>
                {contact.first_name && (
                  <p className="text-sm" style={{ color: colors.$3 }}>
                    {contact.email}
                  </p>
                )}

                {resource.invitations.length >= 1 && (
                  <>
                    <Link
                      to={`${resource.invitations[0].link}?silent=true&client_hash=${client.client_hash}`}
                      external
                    >
                      {t('view_in_portal')}
                    </Link>
                    <CopyToClipboardIconOnly
                      text={resource.invitations[0].link}
                    />
                  </>
                )}
              </div>
            </div>

            {contact.is_locked && <UserUnsubscribedTooltip size={24} />}
          </div>
        ))}
    </>
  );
}
