/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Client } from '$app/common/interfaces/client';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '$app/components/Modal';
import { Button, InputField } from '$app/components/forms';
import { contactEmail, emailableContact } from '../helpers/client-contact';

interface Props {
  open: boolean;
  client: Client | undefined;
  onClose: () => void;
  onSaved: (client: Client) => void;
}

export function ClientContactModal({ open, client, onClose, onSaved }: Props) {
  const [t] = useTranslation();

  const [contact, setContact] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<ValidationBag>();

  useEffect(() => {
    if (!open) {
      return;
    }

    const existing = emailableContact(client);

    setContact({
      first_name: existing?.first_name ?? '',
      last_name: existing?.last_name ?? '',
      email: contactEmail(existing),
    });
    setErrors(undefined);
  }, [open, client]);

  const save = () => {
    if (!client?.id) {
      return;
    }

    const email = contact.email.trim();

    setErrors(undefined);
    setBusy(true);

    const existing = (client.contacts ?? []).map((entry) => {
      const { password, ...rest } = entry;

      return rest;
    });

    const contacts = existing.length
      ? existing.map((entry, index) =>
          index === 0
            ? {
                ...entry,
                first_name: contact.first_name.trim(),
                last_name: contact.last_name.trim(),
                email,
                send_email: true,
              }
            : entry
        )
      : [
          {
            first_name: contact.first_name.trim(),
            last_name: contact.last_name.trim(),
            email,
            send_email: true,
          },
        ];

    request(
      'PUT',
      endpoint('/api/v1/clients/:id', { id: client.id }),
      { ...client, contacts, documents: [] },
      { skipIntercept: true }
    )
      .then((response) => {
        const saved = response.data.data as Client;

        $refetch(['clients']);
        onSaved(saved);
        onClose();
      })
      .catch((caught: AxiosError<ValidationBag>) => {
        if (caught.response?.status === 422) {
          setErrors(caught.response.data);
        } else {
          toast.error();
        }
      })
      .finally(() => setBusy(false));
  };

  return (
    <Modal
      visible={open}
      onClose={onClose}
      title={t('client_contact')}
      size="small"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <InputField
            id="iw-contact-first-name"
            label={t('first_name')}
            value={contact.first_name}
            changeOverride
            debounceTimeout={0}
            onValueChange={(value) =>
              setContact({ ...contact, first_name: value })
            }
            errorMessage={errors?.errors['contacts.0.first_name']}
          />

          <InputField
            id="iw-contact-last-name"
            label={t('last_name')}
            value={contact.last_name}
            changeOverride
            debounceTimeout={0}
            onValueChange={(value) =>
              setContact({ ...contact, last_name: value })
            }
            errorMessage={errors?.errors['contacts.0.last_name']}
          />
        </div>

        <InputField
          id="iw-contact-email"
          type="email"
          required
          label={t('email_address')}
          value={contact.email}
          changeOverride
          debounceTimeout={0}
          onValueChange={(value) => setContact({ ...contact, email: value })}
          errorMessage={errors?.errors['contacts.0.email']}
        />

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="secondary" behavior="button" onClick={onClose}>
            {t('cancel')}
          </Button>

          <Button
            behavior="button"
            disabled={busy}
            disableWithoutIcon={!busy}
            onClick={save}
          >
            {t('save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
