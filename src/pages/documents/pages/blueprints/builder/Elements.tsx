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
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoMdSwap } from 'react-icons/io';
import { useColorScheme } from '$app/common/colors';
import { toast } from '$app/common/helpers/toast/toast';
import { Client } from '$app/common/interfaces/client';
import { AsyncSignatorySelector } from '$app/pages/documents/common/components/AsyncSignatorySelector';

export function SignatorySwap({
  trigger,
  onSelect,
  setCreateDialogOpen,
  ...props
}: SignatorySwapProps) {
  const colors = useColorScheme();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>();

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const update = () => {
      const card = triggerRef.current?.closest(
        '[data-signatory-card]'
      ) as HTMLElement | null;
      const rect = (card ?? triggerRef.current)?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const height = panelRef.current?.offsetHeight ?? 0;
      const below = rect.bottom + 8;
      const above = rect.top - height - 8;

      setPanelStyle({
        position: 'fixed',
        top: below + height > window.innerHeight && above > 0 ? above : below,
        left: rect.left,
        width: Math.min(
          Math.max(rect.width, 260),
          window.innerWidth - rect.left - 16
        ),
        zIndex: 1100,
      });
    };

    update();

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    const observer = new ResizeObserver(update);

    if (panelRef.current) {
      observer.observe(panelRef.current);
    }

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      observer.disconnect();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <>
      <div ref={triggerRef}>
        {trigger ? (
          <div className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            {trigger}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <button type="button" onClick={() => setIsOpen(!isOpen)}>
              <IoMdSwap size={16} />
            </button>
          </div>
        )}
      </div>

      {isOpen &&
        createPortal(
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 1099 }}
              onClick={close}
            />

            <div
              ref={panelRef}
              style={{
                ...panelStyle,
                padding: 12,
                border: `1px solid ${colors.$24}`,
                borderRadius: 8,
                backgroundColor: colors.$1,
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              }}
            >
              <SignatorySelector
                {...props}
                onSelect={(...args) => {
                  onSelect(...args);
                  close();
                }}
                setCreateDialogOpen={(open) => {
                  close();
                  setCreateDialogOpen(open);
                }}
              />
            </div>
          </>,
          document.body
        )}
    </>
  );
}

export function SignatorySelector({
  results,
  onSelect,
  setCreateDialogOpen,
  signatories,
}: SignatorySelectorProps) {
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
