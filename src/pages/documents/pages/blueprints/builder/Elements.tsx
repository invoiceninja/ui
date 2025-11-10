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
import { useClientsQuery } from '$app/common/queries/clients';
import collect from 'collect.js';
import { Client } from '$app/common/interfaces/client';
import { InputLabel, SelectField } from '$app/components/forms';
import { toast } from '$app/common/helpers/toast/toast';
import { useState } from 'react';
import { Modal } from '$app/components/Modal';

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

  const { data: clients } = useClientsQuery({ status: ['active'] });

  const handleSelect = (v: string | undefined) => {
    if (!v) {
      return;
    }

    if (v.startsWith('user')) {
      // In this case we're working with users directly from DocuNinja.

      const [, value] = v.split('|');

      const user = collect(results).firstWhere(
        'value',
        value
      ) as SignatorySelectorProps['results'][number];

      if (user) {
        onSelect(value, 'user', user.entity);
      }

      return;
    }

    if (v === 'create') {
      setCreateDialogOpen(true);

      return;
    }

    // In this case we're handling Invoice Ninja clients.

    const [, value] = v.split('|');

    let entity = clients?.find(
      (client) => client.contacts?.[0]?.contact_key === value
    );

    if (!entity) {
      entity = results.find((r: any) => r.value === value) as unknown as any;
    }

    if (!entity) {
      return;
    }

    const contact = transformToContact(entity as Client);

    if (!contact) {
      return;
    }

    const transformed = transformToPayload(entity, value);

    onSelect(
      `contact|${transformed.contact_key}`,
      'contact',
      contact as any,
      transformed
    );
  };

  const existing = collect(signatories).pluck('id').toArray();

  const existingKeys = collect(signatories)
    .filter((s) => s.metadata !== undefined)
    .map((s) => s.metadata?.contact_key)
    .toArray();

  const list = collect(clients)
    .filter(
      (client) =>
        client.contacts.length > 0 && client.contacts[0].contact_key.length > 0
    )
    .filter((client) => !existingKeys.includes(client.contacts[0].contact_key))
    .map((client) => ({
      label: client.name,
      value: `contact|${client.contacts[0].contact_key}`,
    }))
    .filter((client) => !existing.includes(client.value))
    .toArray() as { label: string; value: string }[];

  const users = collect(results)
    .filter((user) => user.type === 'user')
    .map((user) => ({
      ...user,
      value: `user|${user.value}`,
    }))
    .all();

  return (
    <div className="space-y-3">
      <InputLabel className="mt-3">{t('select_user_or_client')}</InputLabel>

      <SelectField
        placeholder={t('select_user_or_client')}
        onValueChange={handleSelect}
        customSelector
        clearAfterSelection
        className="-mt-2"
        menuPosition={isSwapModal ? undefined : 'fixed'}
      >
        <option value="create">
          <b>&mdash; {t('create_client')} &mdash;</b>
        </option>

        {list.map((client) => (
          <option key={client.value} value={client.value}>
            {client.label}
          </option>
        ))}

        <option disabled>
          <b>&mdash; {t('users')} &mdash;</b>
        </option>

        {users.map((user) => (
          <option key={user.value} value={user.value}>
            {user.label}
          </option>
        ))}
      </SelectField>
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
