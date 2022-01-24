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
import Toggle from 'components/forms/Toggle';
import { set } from 'lodash';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  client: Client;
  setClient: React.Dispatch<React.SetStateAction<Client | undefined>>;
}

export function Contacts(props: Props) {
  const [t] = useTranslation();
  const accentColor = useAccentColor();

  const handleChange = (
    value: string | number | boolean,
    propertyId: string,
    contactId: string
  ) => {
    const contactIndex = props.client.contacts.findIndex(
      (contact) => contact.id === contactId
    );

    props.setClient(
      (client) =>
        client && set(client, `contacts.[${contactIndex}].${propertyId}`, value)
    );
  };

  return (
    <Card className="mt-4 xl:mt-0" title={t('contacts')}>
      {props.client.contacts.map((contact, index, row) => (
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
                  <button className="text-red-600">
                    {t('remove_contact')}
                  </button>
                )}
              </div>

              <div className="w-1/2 flex justify-end">
                {index + 1 === row.length && (
                  <button style={{ color: accentColor }}>
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
