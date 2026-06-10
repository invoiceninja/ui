/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Client } from '$app/common/interfaces/client';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Invoice } from '$app/common/interfaces/invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ClientSelector as Selector } from '$app/components/clients/ClientSelector';
import { CountrySelector } from '$app/components/CountrySelector';
import { Button, Checkbox, InputField, SelectField } from '$app/components/forms';
import { useAtom } from 'jotai';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import {
  clientDraftAtom,
  emptyClientDraft,
} from '../../atoms/client-draft';

interface Props {
  invoice?: Invoice;
  errors: ValidationBag | undefined;
  /** Errors surfaced from a failed inline client POST during the save flow. */
  clientCreationErrors?: ValidationBag;
  onChange: (id: string) => void;
  onLocationChange?: (id: string) => void;
  onClearButtonClick: () => void;
  onContactCheckboxChange: (contactId: string, value: boolean) => void;
  readonly?: boolean;
  disableWithSpinner?: boolean;
}

type Mode = 'select' | 'create';

function useClientsPreview(enabled: boolean) {
  return useQuery(
    ['/api/v1/clients', 'per_page=5', 'simplified-editor-preview'],
    () =>
      request(
        'GET',
        endpoint('/api/v1/clients?per_page=5&status=active')
      ).then(
        (response: GenericSingleResourceResponse<Client[]>) => response.data.data
      ),
    { enabled, staleTime: 60_000 }
  );
}

export function SimplifiedClientCard({
  invoice,
  errors,
  clientCreationErrors,
  onChange,
  onLocationChange,
  onClearButtonClick,
  onContactCheckboxChange,
  readonly,
  disableWithSpinner,
}: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const clientResolver = useClientResolver();
  const hasPermission = useHasPermission();
  const canCreateClient = hasPermission('create_client');

  const [client, setClient] = useState<Client>();
  const [mode, setMode] = useState<Mode>('select');
  const [didApplyAutoMode, setDidApplyAutoMode] = useState(false);
  const [showCreateMore, setShowCreateMore] = useState(false);
  // Tri-state: undefined = still loading / unknown, true = at least one exists, false = zero.
  const [hasAnyClient, setHasAnyClient] = useState<boolean | undefined>(
    undefined
  );

  const [draft, setDraft] = useAtom(clientDraftAtom);
  const createErrors = clientCreationErrors;

  const updateDraft = (patch: Partial<typeof emptyClientDraft>) =>
    setDraft((current) => ({ ...(current ?? emptyClientDraft), ...patch }));

  // Light prefetch — only when no client is selected and we still have a chance
  // to either auto-select the only client or auto-open the create form.
  const shouldPreview = !invoice?.client_id && !readonly && !didApplyAutoMode;

  const { data: previewClients, isLoading: isPreviewLoading } =
    useClientsPreview(shouldPreview);

  // Auto-mode application: runs once per editor session after preview loads.
  useEffect(() => {
    if (didApplyAutoMode || readonly) return;
    if (invoice?.client_id) {
      setDidApplyAutoMode(true);
      return;
    }
    if (isPreviewLoading || !previewClients) return;

    setHasAnyClient(previewClients.length > 0);

    if (previewClients.length === 0 && canCreateClient) {
      setMode('create');
      setDraft((current) => current ?? { ...emptyClientDraft });
    }

    setDidApplyAutoMode(true);
  }, [
    didApplyAutoMode,
    readonly,
    invoice?.client_id,
    isPreviewLoading,
    previewClients,
    canCreateClient,
  ]);

  useEffect(() => {
    if (invoice?.client) {
      setClient(invoice.client);
      return;
    }

    if (invoice?.client_id) {
      clientResolver
        .find(invoice.client_id)
        .then((c) => setClient(c))
        .catch(() => {
          // Silently ignore view_client permission errors.
        });
    } else {
      setClient(undefined);
    }
  }, [invoice?.client_id]);

  // Clear draft on unmount so the atom never leaks across editor sessions.
  useEffect(() => () => setDraft(null), [setDraft]);

  const isContactChecked = (contactId: string) =>
    Boolean(
      invoice?.invitations?.find((i) => i.client_contact_id === contactId)
    );

  const labelClass = 'text-xs font-medium uppercase tracking-wide';

  // Drop the draft when the user explicitly leaves create mode (Select toggle
  // or selecting an existing client). Also wipes the parent save flow.
  const dropDraft = () => {
    setDraft(null);
    setShowCreateMore(false);
  };

  return (
    <div
      className="border rounded-md p-6 space-y-4 self-start w-full"
      style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
    >
      <div className="flex items-center justify-between">
        <span className={labelClass} style={{ color: colors.$22 }}>
          {t('client')}
        </span>

        {!invoice?.client_id &&
          !readonly &&
          canCreateClient &&
          hasAnyClient !== false && (
            <Button
              type="minimal"
              behavior="button"
              onClick={() => {
                setMode((current) => {
                  if (current === 'create') {
                    dropDraft();
                    return 'select';
                  }
                  setDraft((c) => c ?? { ...emptyClientDraft });
                  return 'create';
                });
              }}
              disableWithoutIcon
            >
              <span className="text-xs font-semibold">
                {mode === 'create' ? t('select') : `+ ${t('new_client')}`}
              </span>
            </Button>
          )}
      </div>

      {invoice?.client_id && client && (
        <div className="flex items-start justify-between gap-x-4">
          <div className="flex flex-col">
            <span
              className="text-sm font-semibold"
              style={{ color: colors.$3 }}
            >
              {client.display_name}
            </span>

            {client.contacts?.[0]?.email && (
              <span className="text-xs" style={{ color: colors.$22 }}>
                {client.contacts[0].email}
              </span>
            )}
          </div>

          {!readonly && (
            <Button
              type="minimal"
              behavior="button"
              onClick={() => {
                setClient(undefined);
                onClearButtonClick();
              }}
              disableWithoutIcon
            >
              <span className="text-xs font-semibold">{t('change')}</span>
            </Button>
          )}
        </div>
      )}

      {!invoice?.client_id && mode === 'select' && (
        <Selector
          inputLabel=""
          onChange={(c) => {
            dropDraft();
            onChange(c.id);
          }}
          value={invoice?.client_id}
          readonly={readonly || !invoice}
          clearButton={Boolean(invoice?.client_id)}
          onClearButtonClick={() => {
            setClient(undefined);
            onClearButtonClick();
          }}
          initiallyVisible={false}
          errorMessage={errors?.errors.client_id}
          disableWithSpinner={disableWithSpinner}
          withoutAction
        />
      )}

      {!invoice?.client_id && mode === 'create' && (() => {
        const draftValue = draft ?? emptyClientDraft;
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col space-y-1.5">
                <span className={labelClass} style={{ color: colors.$22 }}>
                  {t('first_name')}
                </span>

                <InputField
                  value={draftValue.first_name}
                  onValueChange={(value) => updateDraft({ first_name: value })}
                  errorMessage={createErrors?.errors['contacts.0.first_name']}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <span className={labelClass} style={{ color: colors.$22 }}>
                  {t('last_name')}
                </span>

                <InputField
                  value={draftValue.last_name}
                  onValueChange={(value) => updateDraft({ last_name: value })}
                  errorMessage={createErrors?.errors['contacts.0.last_name']}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <span className={labelClass} style={{ color: colors.$22 }}>
                {t('email')}
              </span>

              <InputField
                type="email"
                value={draftValue.email}
                onValueChange={(value) => updateDraft({ email: value })}
                errorMessage={
                  createErrors?.errors['contacts.0.email'] ||
                  createErrors?.errors.name?.[0]
                }
              />
            </div>

            <div className="self-start">
              <Button
                type="minimal"
                behavior="button"
                onClick={() => setShowCreateMore((v) => !v)}
                disableWithoutIcon
              >
                <span className="text-xs font-semibold">
                  {showCreateMore ? `− ${t('less')}` : `+ ${t('more')}`}
                </span>
              </Button>
            </div>

            {showCreateMore && (
              <div className="space-y-3">
                <div className="flex flex-col space-y-1.5">
                  <span className={labelClass} style={{ color: colors.$22 }}>
                    {t('company_name')}
                  </span>

                  <InputField
                    value={draftValue.name}
                    onValueChange={(value) => updateDraft({ name: value })}
                    errorMessage={createErrors?.errors.name}
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <span className={labelClass} style={{ color: colors.$22 }}>
                    {t('phone')}
                  </span>

                  <InputField
                    value={draftValue.phone}
                    onValueChange={(value) => updateDraft({ phone: value })}
                    errorMessage={createErrors?.errors.phone}
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <span className={labelClass} style={{ color: colors.$22 }}>
                    {t('address1')}
                  </span>

                  <InputField
                    value={draftValue.address1}
                    onValueChange={(value) => updateDraft({ address1: value })}
                    errorMessage={createErrors?.errors.address1}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col space-y-1.5">
                    <span className={labelClass} style={{ color: colors.$22 }}>
                      {t('city')}
                    </span>

                    <InputField
                      value={draftValue.city}
                      onValueChange={(value) => updateDraft({ city: value })}
                      errorMessage={createErrors?.errors.city}
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <span className={labelClass} style={{ color: colors.$22 }}>
                      {t('postal_code')}
                    </span>

                    <InputField
                      value={draftValue.postal_code}
                      onValueChange={(value) =>
                        updateDraft({ postal_code: value })
                      }
                      errorMessage={createErrors?.errors.postal_code}
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <span className={labelClass} style={{ color: colors.$22 }}>
                    {t('country')}
                  </span>

                  <CountrySelector
                    value={draftValue.country_id}
                    onChange={(value) => updateDraft({ country_id: value })}
                    errorMessage={createErrors?.errors.country_id}
                    dismissable
                  />
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {Boolean(client?.locations?.length) &&
        onLocationChange &&
        invoice?.client_id && (
          <div>
            <span className={labelClass} style={{ color: colors.$22 }}>
              {t('location')}
            </span>

            <div className="mt-2">
              <SelectField
                value={invoice?.location_id}
                onValueChange={(value) => onLocationChange?.(value)}
                customSelector
              >
                {client?.locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>
        )}

      {client && client.contacts.length > 0 && invoice?.client_id && (
        <div className="space-y-2 pt-2">
          <span className={labelClass} style={{ color: colors.$22 }}>
            {t('contacts')}
          </span>

          <div className="space-y-2">
            {client.contacts
              .filter((c) => !c.cc_only)
              .map((contact) => (
                <label
                  key={contact.id}
                  className="flex items-center gap-x-3 cursor-pointer"
                >
                  <Checkbox
                    id={contact.id}
                    value={contact.id}
                    checked={isContactChecked(contact.id)}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      onContactCheckboxChange(
                        event.target.value,
                        event.target.checked
                      )
                    }
                  />

                  <div className="flex flex-col">
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.$3 }}
                    >
                      {contact.first_name || contact.last_name
                        ? `${contact.first_name} ${contact.last_name}`.trim()
                        : contact.email || client.display_name}
                    </span>

                    {contact.first_name && contact.email && (
                      <span className="text-xs" style={{ color: colors.$22 }}>
                        {contact.email}
                      </span>
                    )}
                  </div>
                </label>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
