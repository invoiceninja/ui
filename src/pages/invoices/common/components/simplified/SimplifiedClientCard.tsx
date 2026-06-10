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
import { toast } from '$app/common/helpers/toast/toast';
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Client } from '$app/common/interfaces/client';
import { ClientContact } from '$app/common/interfaces/client-contact';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Invoice } from '$app/common/interfaces/invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankClientQuery } from '$app/common/queries/clients';
import { ClientSelector as Selector } from '$app/components/clients/ClientSelector';
import { CountrySelector } from '$app/components/CountrySelector';
import {
  Button,
  Checkbox,
  InputField,
  SelectField,
} from '$app/components/forms';
import { AxiosError } from 'axios';
import { cloneDeep } from 'lodash';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';

interface Props {
  invoice?: Invoice;
  errors: ValidationBag | undefined;
  onChange: (id: string) => void;
  onLocationChange?: (id: string) => void;
  onClearButtonClick: () => void;
  onContactCheckboxChange: (contactId: string, value: boolean) => void;
  readonly?: boolean;
  disableWithSpinner?: boolean;
}

type Mode = 'select' | 'create';

interface QuickClientDraft {
  first_name: string;
  last_name: string;
  email: string;
  name: string;
  phone: string;
  address1: string;
  city: string;
  postal_code: string;
  country_id: string;
}

const emptyDraft: QuickClientDraft = {
  first_name: '',
  last_name: '',
  email: '',
  name: '',
  phone: '',
  address1: '',
  city: '',
  postal_code: '',
  country_id: '',
};

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
  const [draft, setDraft] = useState<QuickClientDraft>(emptyDraft);
  const [createErrors, setCreateErrors] = useState<ValidationBag>();
  const [isSaving, setIsSaving] = useState(false);
  const [didApplyAutoMode, setDidApplyAutoMode] = useState(false);
  const [showCreateMore, setShowCreateMore] = useState(false);
  // Tri-state: undefined = still loading / unknown, true = at least one exists, false = zero.
  const [hasAnyClient, setHasAnyClient] = useState<boolean | undefined>(
    undefined
  );

  const { data: blankClient } = useBlankClientQuery({
    refetchOnWindowFocus: false,
  });

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

  const isContactChecked = (contactId: string) =>
    Boolean(
      invoice?.invitations?.find((i) => i.client_contact_id === contactId)
    );

  const labelClass = 'text-xs font-medium uppercase tracking-wide';

  const cancelCreate = () => {
    setMode('select');
    setDraft(emptyDraft);
    setCreateErrors(undefined);
    setShowCreateMore(false);
  };

  const handleQuickCreate = () => {
    if (isSaving) return;

    if (!draft.first_name && !draft.last_name && !draft.email) {
      setCreateErrors({
        message: '',
        errors: { name: [t('please_enter_a_client_or_contact_name')] },
      });
      return;
    }

    if (!blankClient) return;

    const payload = cloneDeep(blankClient) as Client;
    payload.name = draft.name;
    payload.phone = draft.phone;
    payload.address1 = draft.address1;
    payload.city = draft.city;
    payload.postal_code = draft.postal_code;
    payload.country_id = draft.country_id;

    const contact: Partial<ClientContact> = {
      first_name: draft.first_name,
      last_name: draft.last_name,
      email: draft.email,
      send_email: true,
      cc_only: false,
    };
    (payload as unknown as { contacts: Partial<ClientContact>[] }).contacts = [
      contact,
    ];

    setIsSaving(true);
    setCreateErrors(undefined);
    toast.processing();

    request('POST', endpoint('/api/v1/clients'), payload)
      .then((response) => {
        toast.success('created_client');

        const created = response.data.data as Client;

        $refetch(['clients']);

        window.dispatchEvent(
          new CustomEvent('invalidate.combobox.queries', {
            detail: { url: endpoint('/api/v1/clients') },
          })
        );

        setDraft(emptyDraft);
        setShowCreateMore(false);
        setMode('select');
        onChange(created.id);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setCreateErrors(error.response.data);
          toast.dismiss();
        }
      })
      .finally(() => setIsSaving(false));
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
              onClick={() =>
                setMode((current) =>
                  current === 'create' ? 'select' : 'create'
                )
              }
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
          onChange={(c) => onChange(c.id)}
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

      {!invoice?.client_id && mode === 'create' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1.5">
              <span className={labelClass} style={{ color: colors.$22 }}>
                {t('first_name')}
              </span>

              <InputField
                value={draft.first_name}
                onValueChange={(value) =>
                  setDraft((d) => ({ ...d, first_name: value }))
                }
                errorMessage={createErrors?.errors['contacts.0.first_name']}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <span className={labelClass} style={{ color: colors.$22 }}>
                {t('last_name')}
              </span>

              <InputField
                value={draft.last_name}
                onValueChange={(value) =>
                  setDraft((d) => ({ ...d, last_name: value }))
                }
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
              value={draft.email}
              onValueChange={(value) =>
                setDraft((d) => ({ ...d, email: value }))
              }
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
                  value={draft.name}
                  onValueChange={(value) =>
                    setDraft((d) => ({ ...d, name: value }))
                  }
                  errorMessage={createErrors?.errors.name}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <span className={labelClass} style={{ color: colors.$22 }}>
                  {t('phone')}
                </span>

                <InputField
                  value={draft.phone}
                  onValueChange={(value) =>
                    setDraft((d) => ({ ...d, phone: value }))
                  }
                  errorMessage={createErrors?.errors.phone}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <span className={labelClass} style={{ color: colors.$22 }}>
                  {t('address1')}
                </span>

                <InputField
                  value={draft.address1}
                  onValueChange={(value) =>
                    setDraft((d) => ({ ...d, address1: value }))
                  }
                  errorMessage={createErrors?.errors.address1}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1.5">
                  <span className={labelClass} style={{ color: colors.$22 }}>
                    {t('city')}
                  </span>

                  <InputField
                    value={draft.city}
                    onValueChange={(value) =>
                      setDraft((d) => ({ ...d, city: value }))
                    }
                    errorMessage={createErrors?.errors.city}
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <span className={labelClass} style={{ color: colors.$22 }}>
                    {t('postal_code')}
                  </span>

                  <InputField
                    value={draft.postal_code}
                    onValueChange={(value) =>
                      setDraft((d) => ({ ...d, postal_code: value }))
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
                  value={draft.country_id}
                  onChange={(value) =>
                    setDraft((d) => ({ ...d, country_id: value }))
                  }
                  errorMessage={createErrors?.errors.country_id}
                  dismissable
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-x-2 pt-1">
            <Button
              type="secondary"
              behavior="button"
              onClick={cancelCreate}
              disabled={isSaving}
            >
              {t('cancel')}
            </Button>

            <Button
              behavior="button"
              onClick={handleQuickCreate}
              disabled={isSaving}
              disableWithoutIcon
            >
              {t('create')}
            </Button>
          </div>
        </div>
      )}

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
