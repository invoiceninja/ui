/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { useAccentColor } from 'common/hooks/useAccentColor';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { ClientContact } from 'common/interfaces/client-contact';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { CustomField } from 'components/CustomField';
import Toggle from 'components/forms/Toggle';
import { set } from 'lodash';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  contacts: Partial<ClientContact>[];
  setContacts: React.Dispatch<React.SetStateAction<Partial<ClientContact>[]>>;
  errors: ValidationBag | undefined;
}

export function Contacts(props: Props) {
  const [t] = useTranslation();
  const accentColor = useAccentColor();
  const company = useCurrentCompany();

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

  const destroy = (index: number) => {
    const contacts = [...props.contacts];

    contacts.splice(index, 1);

    props.setContacts(contacts);
  };

  const create = () => {
    const contacts = [...props.contacts];

    contacts.push({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      send_email: false,
    });

    props.setContacts(contacts);
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
                handleChange(
                  event.target.value,
                  'first_name',
                  contact.id as string
                )
              }
              errorMessage={props.errors?.errors.name}
            />
          </Element>

          <Element leftSide={t('last_name')}>
            <InputField
              id="last_name"
              value={contact.last_name}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleChange(
                  event.target.value,
                  'last_name',
                  contact.id as string
                )
              }
              errorMessage={props.errors?.errors.name}
            />
          </Element>

          <Element leftSide={t('email')}>
            <InputField
              id="email"
              value={contact.email}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleChange(event.target.value, 'email', contact.id as string)
              }
            />
          </Element>

          <Element leftSide={t('phone')}>
            <InputField
              id="phone"
              value={contact.phone}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleChange(event.target.value, 'phone', contact.id as string)
              }
            />
          </Element>

          <Element leftSide={t('add_to_invoices')}>
            <Toggle
              checked={contact.send_email}
              onChange={(value) =>
                handleChange(value, 'send_email', contact.id as string)
              }
            />
          </Element>

          {company?.custom_fields?.contact1 && (
            <CustomField
              field="contact1"
              defaultValue={contact.custom_value1}
              value={company.custom_fields.contact1}
              onChange={(value) =>
                handleChange(value, 'custom_value1', contact.id as string)
              }
            />
          )}

          {company?.custom_fields?.contact2 && (
            <CustomField
              field="contact2"
              defaultValue={contact.custom_value2}
              value={company.custom_fields.contact2}
              onChange={(value) =>
                handleChange(value, 'custom_value2', contact.id as string)
              }
            />
          )}

          {company?.custom_fields?.contact3 && (
            <CustomField
              field="contact3"
              defaultValue={contact.custom_value3}
              value={company.custom_fields.contact3}
              onChange={(value) =>
                handleChange(value, 'custom_value3', contact.id as string)
              }
            />
          )}

          {company?.custom_fields?.contact4 && (
            <CustomField
              field="contact4"
              defaultValue={contact.custom_value4}
              value={company.custom_fields.contact4}
              onChange={(value) =>
                handleChange(value, 'custom_value4', contact.id as string)
              }
            />
          )}

          <Element>
            <div className="flex items-center">
              <div className="w-1/2">
                {props.contacts.length >= 2 && (
                  <button
                    type="button"
                    onClick={() => destroy(index)}
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
