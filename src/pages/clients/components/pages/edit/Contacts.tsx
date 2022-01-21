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
import { Client } from 'common/interfaces/client';
import Toggle from 'components/forms/Toggle';
import { useTranslation } from 'react-i18next';

interface Props {
  client: Client;
  setClient: React.Dispatch<React.SetStateAction<Client | undefined>>;
}

export function Contacts(props: Props) {
  const [t] = useTranslation();

  return (
    <Card className="mt-4 xl:mt-0" title={t('contacts')}>
      {props.client.contacts.map((contact, index) => (
        <div key={index} className="pb-4 mb-4 border-b">
          <Element leftSide={t('first_name')}>
            <InputField id="first_name" value={contact.first_name} />
          </Element>

          <Element leftSide={t('last_name')}>
            <InputField id="last_name" value={contact.last_name} />
          </Element>

          <Element leftSide={t('email')}>
            <InputField id="email" value={contact.email} />
          </Element>

          <Element leftSide={t('phone')}>
            <InputField id="phone" value={contact.phone} />
          </Element>

          <Element leftSide={t('add_to_invoices')}>
            <Toggle />
          </Element>
        </div>
      ))}
    </Card>
  );
}
