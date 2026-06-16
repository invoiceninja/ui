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
import { Client } from '$app/common/interfaces/client';
import { toast } from '$app/common/helpers/toast/toast';
import { useState } from 'react';
import { Modal } from '$app/components/Modal';
import { AsyncSignatorySelector } from '$app/pages/documents/common/components/AsyncSignatorySelector';

export function SignatorySwap({ trigger, ...props }: SignatorySwapProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [t] = useTranslation();

  return (
    <>
      {trigger ? (
        <div className="cursor-pointer" onClick={() => setIsOpen(true)}>
          {trigger}
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <button type="button" onClick={() => setIsOpen(true)}>
            <IoMdSwap size={16} />
          </button>
        </div>
      )}

      <Modal
        visible={isOpen}
        onClose={setIsOpen}
        title={t('swap_signatory')}
        overflowVisible
        withoutVerticalMargin
      >
        <SignatorySelector {...props} isSwapModal />
      </Modal>
    </>
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
}: SignatorySelector) {
  return (
    <AsyncSignatorySelector
      results={results}
      onSelect={onSelect}
      setCreateDialogOpen={setCreateDialogOpen}
      signatories={signatories}
      valuePrefix="contact"
      transformContact={transformToContact}
      transformPayload={transformToPayload}
    />
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
