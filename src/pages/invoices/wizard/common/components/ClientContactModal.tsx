/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from '$app/common/interfaces/client';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '$app/components/Modal';
import { Button, InputField } from '$app/components/forms';
import { contactEmail, emailableContact } from '../helpers/client-contact';
import { useSaveClientContact } from '../hooks/useSaveClientContact';

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
  const saveContact = useSaveClientContact({ setErrors });

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

    setBusy(true);

    saveContact(client, {
      first_name: contact.first_name.trim(),
      last_name: contact.last_name.trim(),
      email: contact.email.trim(),
    })
      .then((saved) => {
        if (saved) {
          onSaved(saved);
          onClose();
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
