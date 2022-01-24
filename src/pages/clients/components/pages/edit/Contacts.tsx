/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { useAccentColor } from 'common/hooks/useAccentColor';
import { Client } from 'common/interfaces/client';
import { ClientContact } from 'common/interfaces/client-contact';
import Toggle from 'components/forms/Toggle';
import { set } from 'lodash';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  contacts: ClientContact[];
  setContacts: React.Dispatch<React.SetStateAction<ClientContact[]>>;
}

export function Contacts(props: Props) {
  const [t] = useTranslation();
  const accentColor = useAccentColor();

  const handleChange = (
    value: string | number | boolean,
    propertyId: string,
    contactId: string
  ) => {
    const contactIndex = props.contacts.findIndex(
      (contact) => contact.id === contactId
    );

    set(props.contacts[contactIndex], propertyId, value);

    props.setContacts(props.contacts);
  };

  const destroy = (id: string) => {
    props.setContacts((contacts) =>
      contacts.filter((contact) => contact.id !== id)
    );
  };

  const create = () => {
    // ...
  };

  return (
    <Card className="mt-4 xl:mt-0" title={t('contacts')}>
      {props.contacts.map((contact, index, row) => (
        <div key={index} className="pb-4 mb-4 border-b">
          <Element leftSide={t('first_name')}>
            <InputField
              id="first_name"
              value={contact.first_name}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleChange(event.target.value, 'first_name', contact.id)
              }
            />
          </Element>

          <Element leftSide={t('last_name')}>
            <InputField
              id="last_name"
              value={contact.last_name}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleChange(event.target.value, 'last_name', contact.id)
              }
            />
          </Element>

          <Element leftSide={t('email')}>
            <InputField
              id="email"
              value={contact.email}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleChange(event.target.value, 'email', contact.id)
              }
            />
          </Element>

          <Element leftSide={t('phone')}>
            <InputField
              id="phone"
              value={contact.phone}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleChange(event.target.value, 'phone', contact.id)
              }
            />
          </Element>

          <Element leftSide={t('add_to_invoices')}>
            <Toggle
              checked={contact.send_email}
              onChange={(value) =>
                handleChange(value, 'send_email', contact.id)
              }
            />
          </Element>

          <Element>
            <div className="flex items-center">
              <div className="w-1/2">
                {row.length >= 2 && (
                  <button
                    type="button"
                    onClick={() => destroy(contact.id)}
                    className="text-red-600"
                  >
                    {t('remove_contact')}
                  </button>
                )}
              </div>

              <div className="w-1/2 flex justify-end">
                {index + 1 === row.length && (
                  <button
                    type="button"
                    onClick={create}
                    style={{ color: accentColor }}
                  >
                    {t('add_contact')}
                  </button>
                )}
              </div>
            </div>
          </Element>
        </div>
      ))}
    </Card>
  );
}
