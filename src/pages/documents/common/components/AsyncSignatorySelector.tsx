/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { SignatorySelectorProps } from '@docuninja/builder2.0';
import { useTranslation } from 'react-i18next';
import collect from 'collect.js';
import { Client } from '$app/common/interfaces/client';
import { Combobox, Entry } from '$app/components/forms/Combobox';
import { InputLabel } from '$app/components/forms';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useEffect, useMemo, useRef, useState } from 'react';
import { get } from 'lodash';
interface Props {
  results: SignatorySelectorProps['results'];
  onSelect: SignatorySelectorProps['onSelect'];
  setCreateDialogOpen: (open: boolean) => void;
  signatories?: SignatorySelectorProps['signatories'];
  valuePrefix?: 'contact' | 'client';
  transformContact?: (client: Client) => Record<string, unknown> | null;
  transformPayload?: (
    client: Client,
    contactKey: string
  ) => Record<string, unknown>;
}

export function AsyncSignatorySelector({
  results,
  onSelect,
  setCreateDialogOpen,
  signatories,
  valuePrefix = 'contact',
  transformContact,
  transformPayload,
}: Props) {
  const [t] = useTranslation();

  const [pendingSelect, setPendingSelect] = useState<string>();
  const [clients, setClients] = useState<Client[]>([]);
  const [, setIsFetching] = useState(false);

  const lastSearchRef = useRef('');

  const existing = useMemo(
    () => (signatories ? collect(signatories).pluck('id').toArray() : []),
    [signatories]
  );

  const existingKeys = useMemo(
    () =>
      signatories
        ? collect(signatories)
            .filter((s) => s.metadata !== undefined)
            .map((s) => s.metadata?.contact_key)
            .toArray()
        : [],
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
        endpoint(`/api/v1/clients?per_page=500&status=active&filter=${filter}`)
      );

      setClients(response.data.data);
    } catch {
      //
    } finally {
      setIsFetching(false);
    }
  };

  const buildClientLabel = (client: Client) => {
    const contact = client.contacts[0];

    if (!contact) {
      return client.name;
    }

    const parts = [contact.first_name, contact.last_name].filter(Boolean);
    const name = parts.length > 0 ? parts.join(' ') : null;

    if (name && contact.email) {
      return `${name} (${contact.email}) - ${client.name}`;
    }

    if (name) {
      return `${name} - ${client.name}`;
    }

    return client.name;
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
        label: buildClientLabel(client),
        value: `${valuePrefix}|${client.contacts[0].contact_key}`,
        resource: client,
        eventType: 'internal' as const,
        searchable: [
          client.name,
          client.contacts[0].first_name,
          client.contacts[0].last_name,
          client.contacts[0].email || '',
        ]
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
  }, [clients, results, existing, existingKeys, valuePrefix]);

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

    if (value.startsWith(`${valuePrefix}|`)) {
      const contactKey = value.replace(`${valuePrefix}|`, '');

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

      if (transformContact && transformPayload) {
        const contact = transformContact(entity as Client);

        if (!contact) {
          return;
        }

        const transformed = transformPayload(entity, contactKey);

        onSelect(
          `${valuePrefix}|${transformed.contact_key || contactKey}`,
          'contact',
          contact as any,
          transformed
        );
      } else {
        onSelect(contactKey, valuePrefix as 'contact', entity as any);
      }
    }
  };

  useEffect(() => {
    const handler = (data: Event) => {
      const key = get(data, 'detail.data.contacts.0.contact_key');
      const id = `${valuePrefix}|${key}`;

      setPendingSelect(id);
      lastSearchRef.current = '';
      fetchClients('');
    };

    window.addEventListener('builder:signatory-created', handler);

    return () =>
      window.removeEventListener('builder:signatory-created', handler);
  }, [valuePrefix]);

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
          placeholder: t('select_user_or_client') as string,
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
