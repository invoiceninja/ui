/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Checkbox, InputLabel, Link, SelectField } from '$app/components/forms';
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { Client } from '$app/common/interfaces/client';
import { Invoice } from '$app/common/interfaces/invoice';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientSelector as Selector } from '$app/components/clients/ClientSelector';
import { CopyToClipboardIconOnly } from '$app/components/CopyToClipBoardIconOnly';
import { useColorScheme } from '$app/common/colors';
import { UserUnsubscribedTooltip } from '$app/pages/clients/common/components/UserUnsubscribedTooltip';
import { ClientActionButtons } from './ClientActionButtons';
import { Tooltip } from '$app/components/Tooltip';

interface Props {
  readonly?: boolean;
  resource?: Invoice | RecurringInvoice;
  onChange: (id: string) => unknown;
  onClearButtonClick: () => unknown;
  onContactCheckboxChange: (contactId: string, value: boolean) => unknown;
  errorMessage?: string | string[];
  disableWithSpinner?: boolean;
  textOnly?: boolean;
  onLocationChange?: (locationId: string) => void;
}

export function ClientSelector(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const [client, setClient] = useState<Client>();

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

  return (
    <>
      <div
        className="flex flex-col justify-between space-y-2"
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

        {client && <ClientActionButtons client={client} />}

        {Boolean(resource?.client_id) && (
          <>
            {Boolean(client?.locations?.length) && props.onLocationChange && (
              <div className="pt-4">
                <SelectField
                  label={t('location')}
                  value={resource?.location_id}
                  onValueChange={(value) => props.onLocationChange?.(value)}
                  customSelector
                >
                  {client?.locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </SelectField>
              </div>
            )}
          </>
        )}
      </div>

      {resource?.client_id && client && client.contacts.length && (
        <div>
          {Boolean(
            (props.onLocationChange && Boolean(client?.locations?.length)) ||
              location
          ) && <InputLabel className="mb-2">{t('contacts')}</InputLabel>}

          {client.contacts.map((contact, index) => (
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

                <div className="relative">
                  {contact.first_name && (
                    <p className="text-sm" style={{ color: colors.$3 }}>
                      {contact.email}
                    </p>
                  )}

                  {resource.invitations.length >= 1 && (
                    <div className="flex space-x-2 mt-1">
                      <Link
                        to={`${resource.invitations[0].link}?silent=true&client_hash=${client.client_hash}`}
                        external
                      >
                        {t('view_in_portal')}
                      </Link>

                      <Tooltip
                        width="auto"
                        placement="bottom"
                        message={t('copy_link') as string}
                        withoutArrow
                      >
                        <CopyToClipboardIconOnly
                          text={resource.invitations[0].link}
                        />
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>

              {contact.is_locked && <UserUnsubscribedTooltip size={24} />}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
