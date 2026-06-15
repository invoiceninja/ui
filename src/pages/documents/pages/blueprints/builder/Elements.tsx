/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  SignatorySelectorProps,
  SignatorySwapProps,
} from '@docuninja/builder2.0';
import { useTranslation } from 'react-i18next';
import { IoMdSwap } from 'react-icons/io';
import collect from 'collect.js';
import { Client } from '$app/common/interfaces/client';
import { Combobox, Entry } from '$app/components/forms/Combobox';
import { InputLabel } from '$app/components/forms';
import { toast } from '$app/common/helpers/toast/toast';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '$app/components/Modal';
import { get } from 'lodash';
import { formatLabel } from './formatLabel';

export function SignatorySwap(props: SignatorySwapProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [t] = useTranslation();

  return (
    <div className="flex items-center justify-center">
      <button type="button" onClick={() => setIsOpen(true)}>
        <IoMdSwap size={16} />
      </button>

      <Modal
        visible={isOpen}
        onClose={setIsOpen}
        title={t('swap_signatory')}
        overflowVisible
        withoutVerticalMargin
      >
        <SignatorySelector {...props} isSwapModal />
      </Modal>
    </div>
  );
}

type SignatorySelector = SignatorySelectorProps & {
  isSwapModal?: boolean;
};

export function SignatorySelector({
  results,
  onSelect,
  setCreateDialogOpen,
  signatories,
  isSwapModal = false,
}: SignatorySelector) {
  const [t] = useTranslation();
  const [pendingSelect, setPendingSelect] = useState<string>();
  const [clients, setClients] = useState<Client[]>([]);
  const [, setIsFetching] = useState(false);

  const lastSearchRef = useRef('');

  const existing = useMemo(
    () => collect(signatories).pluck('id').toArray(),
    [signatories]
  );

  const existingKeys = useMemo(
    () =>
      collect(signatories)
        .filter((s) => s.metadata !== undefined)
        .map((s) => s.metadata?.contact_key)
        .toArray(),
    [signatories]
  );

  useEffect(() => {
    fetchClients('');
  }, []);

  const fetchClients = async (filter: string) => {
    setIsFetching(true);

    try {
      const response = await request(
        'GET',
        endpoint(
          `/api/v1/clients?per_page=500&status=active&filter=${filter}`
        )
      );

      setClients(response.data.data);
    } catch {
      //
    } finally {
      setIsFetching(false);
    }
  };

  const entries: Entry[] = useMemo(() => {
    const clientEntries: Entry[] = clients
      .filter(
        (client) =>
          client.contacts.length > 0 &&
          client.contacts[0].contact_key.length > 0
      )
      .filter(
        (client) => !existingKeys.includes(client.contacts[0].contact_key)
      )
      .map((client) => ({
        id: client.id,
        label: formatLabel(
          client.contacts[0].first_name,
          client.contacts[0].last_name,
          client.contacts[0].email,
          client.name
        ),
        value: `contact|${client.contacts[0].contact_key}`,
        resource: client,
        eventType: 'internal' as const,
        searchable: [client.name, client.contacts[0].email || '']
          .filter(Boolean)
          .join(' '),
      }))
      .filter((client) => !existing.includes(client.value));

    const userEntries: Entry[] = collect(results)
      .filter((user: any) => user.type === 'user')
      .map((user: any) => ({
        ...user,
        id: user.value,
        value: `user|${user.value}`,
        eventType: 'internal' as const,
        searchable: user.label,
      }))
      .filter((user: any) => !existing.includes(user.value))
      .all();

    return [...clientEntries, ...userEntries];
  }, [clients, results, existing, existingKeys]);

  const handleSearch = (query: string) => {
    if (query === lastSearchRef.current) {
      return;
    }

    lastSearchRef.current = query;

    fetchClients(query);
  };

  const handleChange = (entry: Entry) => {
    const value = entry.value?.toString() || '';

    if (value === 'create') {
      setCreateDialogOpen(true);

      return;
    }

    if (value.startsWith('user|')) {
      const id = value.replace('user|', '');

      const user = collect(results).firstWhere(
        'value',
        id
      ) as SignatorySelectorProps['results'][number];

      if (user) {
        onSelect(id, 'user', user.entity);
      }

      return;
    }

    if (value.startsWith('contact|')) {
      const contactKey = value.replace('contact|', '');

      let entity = clients?.find(
        (client) => client.contacts?.[0]?.contact_key === contactKey
      );

      if (!entity) {
        entity = results.find(
          (r: any) => r.value === contactKey
        ) as unknown as any;
      }

      if (!entity) {
        return;
      }

      const contact = transformToContact(entity as Client);

      if (!contact) {
        return;
      }

      const transformed = transformToPayload(entity, contactKey);

      onSelect(
        `contact|${transformed.contact_key}`,
        'contact',
        contact as any,
        transformed
      );
    }
  };

  useEffect(() => {
    const handler = (data: Event) => {
      const key = get(data, 'detail.data.contacts.0.contact_key');
      const id = `contact|${key}`;

      setPendingSelect(id);
      lastSearchRef.current = '';
      fetchClients('');
    };

    window.addEventListener('builder:signatory-created', handler);

    return () =>
      window.removeEventListener('builder:signatory-created', handler);
  }, []);

  useEffect(() => {
    if (pendingSelect) {
      const entry = entries.find((e) => e.value === pendingSelect);

      if (entry) {
        handleChange(entry);
      }

      setPendingSelect(undefined);
    }
  }, [entries, pendingSelect]);

  return (
    <div className="space-y-3">
      <InputLabel className="mt-3">{t('select_user_or_client')}</InputLabel>

      <Combobox
        inputOptions={{
          value: null,
          placeholder: t('select_user_or_client'),
        }}
        entries={entries}
        entryOptions={{
          id: 'id',
          label: 'label',
          value: 'value',
          searchable: 'searchable',
        }}
        onChange={handleChange}
        onEmptyValues={handleSearch}
        clearInputAfterSelection
        action={{
          label: t('create_client'),
          visible: true,
          onClick: () => setCreateDialogOpen(true),
        }}
        withShadow
      />
    </div>
  );
}

function transformToContact(client: Client) {
  if (client.contacts.length === 0) {
    toast.error('Error: Client has no contacts. Please add a contact first.');

    return null;
  }

  const contact = client.contacts[0];

  return {
    id: `contact|${contact.contact_key}`,
    user_id: client.user_id ?? null,
    company_id: null,
    client_id: client.id,
    first_name: contact.first_name ?? null,
    last_name: contact.last_name ?? null,
    phone: contact.phone ?? null,
    email: contact.email ?? null,
    signature_base64: null,
    initials_base64: null,
    email_verified_at: null,
    is_primary: Boolean(contact.is_primary),
    last_login: null,
    created_at: '',
    updated_at: '',
    deleted_at: null,
    e_signature: null,
    e_initials: null,
    client: {
      id: client.id,
      user_id: client.user_id,
      company_id: null,
      name: client.name ?? null,
      website: client.website ?? null,
      private_notes: client.private_notes ?? null,
      public_notes: client.public_notes ?? null,
      logo: null,
      phone: client.phone ?? null,
      balance: client.balance ?? 0,
      paid_to_date: client.paid_to_date ?? 0,
      currency_id: client.settings?.currency_id
        ? Number(client.settings.currency_id)
        : null,
      address1: client.address1 ?? null,
      address2: client.address2 ?? null,
      city: client.city ?? null,
      state: client.state ?? null,
      postal_code: client.postal_code ?? null,
      country_id: client.country_id ? Number(client.country_id) : null,
      is_deleted: Boolean(client.is_deleted),
      vat_number: client.vat_number ?? null,
      id_number: client.id_number ?? null,
      created_at: '',
      updated_at: '',
      deleted_at: null,
    },
  };
}

function transformToPayload(client: Client, contact: string) {
  return {
    ...client,
    contact_key: contact,
  };
}
