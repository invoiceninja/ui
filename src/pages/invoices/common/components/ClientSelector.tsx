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
import { ChangeEvent, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientSelector as Selector } from '$app/components/clients/ClientSelector';
import { CopyToClipboardIconOnly } from '$app/components/CopyToClipBoardIconOnly';
import { useColorScheme } from '$app/common/colors';
import { UserUnsubscribedTooltip } from '$app/pages/clients/common/components/UserUnsubscribedTooltip';
import { ClientActionButtons } from './ClientActionButtons';
import { Tooltip } from '$app/components/Tooltip';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import classNames from 'classnames';
import { Element } from '$app/components/cards';

interface Props {
  readonly?: boolean;
  resource?: Invoice | RecurringInvoice;
  onChange: (id: string) => unknown;
  onClearButtonClick: () => unknown;
  onContactCheckboxChange: (contactId: string, value: boolean) => unknown;
  onContactCanSignCheckboxChange?: (contactId: string, value: boolean) => unknown;
  errorMessage?: string | string[];
  disableWithSpinner?: boolean;
  textOnly?: boolean;
  onLocationChange?: (locationId: string) => void;
}

export function ClientSelector(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const reactSettings = useReactSettings();
  const company = useCurrentCompany();
  const clientResolver = useClientResolver();

  const [client, setClient] = useState<Client>();

  const { resource } = props;

  const handleCheckedState = (contactId: string) => {
    const potential = resource?.invitations.find(
      (i) => i.client_contact_id === contactId
    );

    return Boolean(potential);
  };

  const isContactInvited = useCallback((contactId: string) => {
    const isInvited = resource?.invitations?.some(inv => inv.client_contact_id === contactId) || false;
    console.log('isContactInvited:', { contactId, isInvited, invitations: resource?.invitations });
    return isInvited;
  }, [resource?.invitations]);

  const getCanSignState = useCallback((contactId: string) => {
    if (!resource?.invitations || !client?.contacts) {
      return false;
    }

    // Find the invitation for this contact
    const invitation = resource.invitations.find(inv => inv.client_contact_id === contactId);
    
    // Return the can_sign property if it exists, otherwise false
    return invitation?.can_sign || false;
  }, [resource?.invitations, client?.contacts]);

  useEffect(() => {
    resource?.client_id &&
      clientResolver
        .find(resource.client_id)
        .then((client) => setClient(client));
  }, [resource?.client_id]);

  return (
    <div className="flex flex-col space-y-4">
      <div
        className="flex flex-col justify-between space-y-0.5"
        style={{ color: colors.$3 }}
      >
        {props.textOnly ? (
          <div className="flex space-x-10">
            <span className="text-sm font-medium" style={{ color: colors.$22 }}>
              {t('client')}
            </span>

            <span className="text-sm font-medium">
              {resource?.client?.display_name}
            </span>
          </div>
        ) : (
          <Selector
            inputLabel={t('client')}
            onChange={(client) => props.onChange(client.id)}
            value={resource?.client_id}
            readonly={props.readonly || !resource}
            clearButton={Boolean(resource?.client_id)}
            onClearButtonClick={() => {
              setClient(undefined);
              props.onClearButtonClick();
            }}
            initiallyVisible={!resource?.client_id}
            errorMessage={props.errorMessage}
            disableWithSpinner={props.disableWithSpinner}
          />
        )}

        {client && <ClientActionButtons client={client} />}

        {Boolean(resource?.client_id) && (
          <>
            {Boolean(client?.locations?.length) && props.onLocationChange && (
              <div className="pt-3">
                <Element
                  leftSide={t('location')}
                  noExternalPadding
                  noVerticalPadding
                >
                  <SelectField
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
                </Element>
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
          ) && <InputLabel className="mb-2.5">{t('contacts')}</InputLabel>}

          <div
            className={classNames('divide-y divide-dashed', {
              'divide-[#09090B1A]': !reactSettings.dark_mode,
              'divide-[#1f2e41]': reactSettings.dark_mode,
            })}
          >
            {client.contacts.map((contact, index) => (
              <div
                key={index}
                className={classNames(
                  'flex justify-between items-center first:pt-0 pt-2',
                  {
                    'pb-1.5': !resource.invitations[0]?.link,
                  }
                )}
              >
                <div className="flex flex-col w-full">
                  <div className="flex space-x-2.5 w-full">
                    <Checkbox
                      id={contact.id}
                      value={contact.id}
                      checked={handleCheckedState(contact.id)}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        props.onContactCheckboxChange(
                          event.target.value,
                          event.target.checked
                        )
                      }
                    />

                    <div
                      className={classNames('flex truncate', {
                        'flex-col': !resource.invitations[0]?.link,
                        'space-x-4': resource.invitations[0]?.link,
                      })}
                    >
                      <span
                        className="text-sm font-medium"
                        style={{ color: colors.$3 }}
                      >
                        {contact.first_name.length >= 1
                          ? `${contact.first_name} ${contact.last_name}`
                          : contact.email || client.display_name}
                      </span>

                      {contact.first_name && (
                        <span className="text-sm" style={{ color: colors.$22 }}>
                          {contact.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {company?.enable_modules && (
                    <div className="flex space-x-2.5 w-full mt-2">
                      <Checkbox
                        id={`can-sign-${contact.id}`}
                        checked={getCanSignState(contact.id)}
                        disabled={false}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          console.log('Authorized to sign checkbox clicked:', { 
                            contactId: contact.id, 
                            checked: event.target.checked, 
                            isInvited: isContactInvited(contact.id),
                            hasHandler: !!props.onContactCanSignCheckboxChange 
                          });
                          props.onContactCanSignCheckboxChange?.(
                            contact.id,
                            event.target.checked
                          );
                        }}
                      />

                      <div className="flex truncate">
                        <span
                          className={`text-sm font-medium ${
                            !isContactInvited(contact.id) ? 'opacity-50' : ''
                          }`}
                          style={{ color: colors.$3 }}
                        >
                          {t('authorized_to_sign')}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col relative left-7">
                    {Boolean(
                      resource.invitations.length >= 1 &&
                        resource.invitations[0].link
                    ) && (
                      <div className="flex items-center space-x-2">
                        <Link
                          className="font-medium"
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
                          <div className="mt-1.5">
                            <CopyToClipboardIconOnly
                              text={resource.invitations[0].link}
                            />
                          </div>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </div>
                  
                {contact.is_locked && <UserUnsubscribedTooltip size={24} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
