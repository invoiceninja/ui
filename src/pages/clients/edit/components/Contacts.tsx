/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { Button, InputField } from '$app/components/forms';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { ClientContact } from '$app/common/interfaces/client-contact';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { CustomField } from '$app/components/CustomField';
import Toggle from '$app/components/forms/Toggle';
import { set } from 'lodash';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 } from 'uuid';
import { useColorScheme } from '$app/common/colors';
import { UserUnsubscribedTooltip } from '../../common/components/UserUnsubscribedTooltip';
import { Plus } from '$app/components/icons/Plus';
import { Trash } from '$app/components/icons/Trash';
import classNames from 'classnames';

interface Props {
  contacts: Partial<ClientContact>[];
  setContacts: Dispatch<SetStateAction<Partial<ClientContact>[]>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  errors: ValidationBag | undefined;
}

export function Contacts(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const company = useCurrentCompany();
  const accentColor = useAccentColor();

  const handleChange = (
    value: string | number | boolean,
    propertyId: string,
    contactId: string
  ) => {
    props.setErrors(undefined);

    const contactIndex = props.contacts.findIndex(
      (contact) => contact.contact_key === contactId
    );

    set(props.contacts[contactIndex], propertyId, value);

    props.setContacts([...props.contacts]);
  };

  const destroy = (index: number) => {
    const contacts = [...props.contacts];

    contacts.splice(index, 1);

    props.setContacts(contacts);
  };

  const create = () => {
    const contacts = [...props.contacts];

    contacts.push({
      contact_key: v4().replaceAll('-', ''),
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      send_email: false,
    });

    props.setContacts(contacts);
  };

  const handleAddContact = () => {
    create();

    setTimeout(() => {
      const contactElements = document.querySelectorAll('[id^="first_name_"]');

      if (contactElements.length > 2) {
        const lastContactElement = contactElements[contactElements.length - 1];
        lastContactElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 50);
  };

  return (
    <Card
      className="shadow-sm"
      title={t('contacts')}
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutBodyPadding
      topRight={
        <Button
          className="shadow-sm"
          type="secondary"
          behavior="button"
          onClick={handleAddContact}
        >
          <div className="flex items-center">
            <div>
              <Plus size="0.7rem" color={colors.$3} />
            </div>

            <span className="font-medium">{t('add_contact')}</span>
          </div>
        </Button>
      }
    >
      {props.contacts.map((contact, index) => (
        <div key={index} className="px-6">
          <div
            className={classNames('pb-2 pt-4 border-b border-dashed', {
              'border-b-0': index === props.contacts.length - 1,
            })}
            style={{ borderColor: colors.$24 }}
          >
            <Element leftSide={t('first_name')} noExternalPadding>
              <InputField
                id={`first_name_${index}`}
                value={contact.first_name}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleChange(
                    event.target.value,
                    'first_name',
                    contact.contact_key as string
                  )
                }
                errorMessage={props.errors?.errors.name}
              />
            </Element>

            <Element leftSide={t('last_name')} noExternalPadding>
              <InputField
                id={`last_name_${index}`}
                value={contact.last_name}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleChange(
                    event.target.value,
                    'last_name',
                    contact.contact_key as string
                  )
                }
                errorMessage={props.errors?.errors.name}
              />
            </Element>

            <Element leftSide={t('email')} noExternalPadding>
              <InputField
                id={`email_${index}`}
                value={contact.email}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleChange(
                    event.target.value,
                    'email',
                    contact.contact_key as string
                  )
                }
                errorMessage={props.errors?.errors[`contacts.${index}.email`]}
              />
            </Element>

            {company?.settings.enable_client_portal_password && (
              <Element leftSide={t('password')} noExternalPadding>
                <InputField
                  id={`password_${index}`}
                  type="password"
                  value={contact.password}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    handleChange(
                      event.target.value,
                      'password',
                      contact.contact_key as string
                    )
                  }
                  errorMessage={
                    props.errors?.errors[`contacts.${index}.password`]
                  }
                />
              </Element>
            )}

            <Element leftSide={t('phone')} noExternalPadding>
              <InputField
                id={`phone_${index}`}
                value={contact.phone}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleChange(
                    event.target.value,
                    'phone',
                    contact.contact_key as string
                  )
                }
                errorMessage={props.errors?.errors[`contacts.${index}.phone`]}
              />
            </Element>

            <Element leftSide={t('add_to_invoices')} noExternalPadding>
              <Toggle
                checked={Boolean(contact?.send_email)}
                onChange={(value) =>
                  handleChange(
                    value,
                    'send_email',
                    contact.contact_key as string
                  )
                }
              />
            </Element>

            {company?.custom_fields?.contact1 && (
              <CustomField
                field="contact1"
                defaultValue={contact.custom_value1}
                value={company.custom_fields.contact1}
                onValueChange={(value) =>
                  handleChange(
                    value,
                    'custom_value1',
                    contact.contact_key as string
                  )
                }
                noExternalPadding
              />
            )}

            {company?.custom_fields?.contact2 && (
              <CustomField
                field="contact2"
                defaultValue={contact.custom_value2}
                value={company.custom_fields.contact2}
                onValueChange={(value) =>
                  handleChange(
                    value,
                    'custom_value2',
                    contact.contact_key as string
                  )
                }
                noExternalPadding
              />
            )}

            {company?.custom_fields?.contact3 && (
              <CustomField
                field="contact3"
                defaultValue={contact.custom_value3}
                value={company.custom_fields.contact3}
                onValueChange={(value) =>
                  handleChange(
                    value,
                    'custom_value3',
                    contact.contact_key as string
                  )
                }
                noExternalPadding
              />
            )}

            {company?.custom_fields?.contact4 && (
              <CustomField
                field="contact4"
                defaultValue={contact.custom_value4}
                value={company.custom_fields.contact4}
                onValueChange={(value) =>
                  handleChange(
                    value,
                    'custom_value4',
                    contact.contact_key as string
                  )
                }
                noExternalPadding
              />
            )}

            <Element
              {...(contact.is_locked && {
                leftSide: (
                  <div className="flex">
                    <UserUnsubscribedTooltip size={25} />
                  </div>
                ),
              })}
              noExternalPadding
              pushContentToRight
            >
              <div className="flex items-center">
                {props.contacts.length >= 2 && (
                  <Button
                    className="shadow-sm"
                    type="secondary"
                    behavior="button"
                    onClick={() => destroy(index)}
                  >
                    <div className="flex space-x-2 items-center">
                      <div>
                        <Trash size="1rem" color="#ef4444" />
                      </div>

                      <span className="font-medium text-red-500">
                        {t('remove_contact')}
                      </span>
                    </div>
                  </Button>
                )}
              </div>
            </Element>
          </div>
        </div>
      ))}
    </Card>
  );
}
