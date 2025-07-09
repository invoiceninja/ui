/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { Client, ClientContact } from '$app/common/interfaces/docuninja/api';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Card, Element } from '$app/components/cards';
import { CountrySelector } from '$app/components/CountrySelector';
import { CurrencySelector } from '$app/components/CurrencySelector';
import { Button, InputField } from '$app/components/forms';
import { Plus } from '$app/components/icons/Plus';
import { Trash } from '$app/components/icons/Trash';
import { Spinner } from '$app/components/Spinner';
import classNames from 'classnames';
import { cloneDeep, set } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 } from 'uuid';

interface Props {
  client: Client | undefined;
  errors: ValidationBag | undefined;
  handleChange: (
    key: string,
    value: string | number | boolean | ClientContact[]
  ) => void;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  isLoading: boolean;
}

export function Form({
  client,
  errors,
  handleChange,
  setErrors,
  isLoading,
}: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const handleChangeContact = (
    value: string | number | boolean,
    propertyId: string,
    contactId: string
  ) => {
    setErrors(undefined);

    const contactIndex = client?.contacts.findIndex(
      (contact) => contact.contact_key === contactId
    );

    if (contactIndex !== undefined) {
      set(client?.contacts[contactIndex] as ClientContact, propertyId, value);

      handleChange('contacts', cloneDeep(client?.contacts as ClientContact[]));
    }
  };

  const deleteContact = (index: number) => {
    const contacts = cloneDeep(client?.contacts);

    if (contacts) {
      contacts.splice(index, 1);

      handleChange('contacts', cloneDeep(contacts));
    }
  };

  const createContact = () => {
    const contacts = cloneDeep(client?.contacts);

    if (contacts) {
      contacts.push({
        id: v4().replaceAll('-', ''),
        contact_key: v4().replaceAll('-', ''),
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        user_id: '',
        company_id: '',
        client_id: null,
        is_primary: false,
        last_login: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
        e_signature: null,
        e_initials: null,
        email_verified_at: null,
        signature_base64: null,
        initials_base64: null,
      });
    }

    handleChange('contacts', cloneDeep(contacts) as ClientContact[]);
  };

  const handleAddContact = () => {
    createContact();

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <Card
          className="shadow-sm"
          title={t('details')}
          childrenClassName="pt-4 pb-8"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
          withoutBodyPadding
        >
          <Element leftSide={t('name')}>
            <InputField
              value={client?.name || ''}
              onValueChange={(value) => handleChange('name', value)}
              errorMessage={errors?.errors.name}
            />
          </Element>

          <Element leftSide={t('phone')}>
            <InputField
              value={client?.phone || ''}
              onValueChange={(value) => handleChange('phone', value)}
              errorMessage={errors?.errors.phone}
            />
          </Element>

          <Element leftSide={t('website')}>
            <InputField
              value={client?.website || ''}
              onValueChange={(value) => handleChange('website', value)}
              errorMessage={errors?.errors.website}
            />
          </Element>

          <Element leftSide={t('currency')}>
            <CurrencySelector
              value={client?.currency_id || ''}
              onChange={(value) => handleChange('currency_id', value)}
              errorMessage={errors?.errors.currency_id}
            />
          </Element>

          <div className="px-4 sm:px-6 mt-4">
            <InputField
              element="textarea"
              label={t('private_notes') as string}
              value={client?.private_notes || ''}
              onValueChange={(value) => handleChange('private_notes', value)}
              errorMessage={errors?.errors.private_notes}
            />
          </div>

          <div className="px-4 sm:px-6 mt-4">
            <InputField
              element="textarea"
              label={t('public_notes') as string}
              value={client?.public_notes || ''}
              onValueChange={(value) => handleChange('public_notes', value)}
              errorMessage={errors?.errors.public_notes}
            />
          </div>
        </Card>

        <Card
          className="shadow-sm"
          title={t('address')}
          childrenClassName="pt-4 pb-6"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
          withoutBodyPadding
        >
          <Element leftSide={t('address1')}>
            <InputField
              value={client?.address1 || ''}
              onValueChange={(value) => handleChange('address1', value)}
              errorMessage={errors?.errors.address1}
            />
          </Element>

          <Element leftSide={t('address2')}>
            <InputField
              value={client?.address2 || ''}
              onValueChange={(value) => handleChange('address2', value)}
              errorMessage={errors?.errors.address2}
            />
          </Element>

          <Element leftSide={t('city')}>
            <InputField
              value={client?.city || ''}
              onValueChange={(value) => handleChange('city', value)}
              errorMessage={errors?.errors.city}
            />
          </Element>

          <Element leftSide={t('state')}>
            <InputField
              value={client?.state || ''}
              onValueChange={(value) => handleChange('state', value)}
              errorMessage={errors?.errors.state}
            />
          </Element>

          <Element leftSide={t('postal_code')}>
            <InputField
              value={client?.postal_code || ''}
              onValueChange={(value) => handleChange('postal_code', value)}
              errorMessage={errors?.errors.postal_code}
            />
          </Element>

          <Element leftSide={t('country')}>
            <CountrySelector
              value={client?.country_id || ''}
              onChange={(value) => handleChange('country_id', value)}
              errorMessage={errors?.errors.country_id}
            />
          </Element>
        </Card>
      </div>

      <Card
        className="shadow-sm h-max"
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
        {client?.contacts.map((contact, index) => (
          <div key={index} className="px-6">
            <div
              className={classNames('pb-2 pt-4 border-b border-dashed', {
                'border-b-0': index === client?.contacts?.length - 1,
              })}
              style={{ borderColor: colors.$24 }}
            >
              <Element leftSide={t('first_name')} noExternalPadding>
                <InputField
                  id={`first_name_${index}`}
                  value={contact.first_name}
                  onValueChange={(value) =>
                    handleChangeContact(
                      value,
                      'first_name',
                      contact.contact_key as string
                    )
                  }
                  errorMessage={errors?.errors[`contacts.${index}.first_name`]}
                />
              </Element>

              <Element leftSide={t('last_name')} noExternalPadding>
                <InputField
                  id={`last_name_${index}`}
                  value={contact.last_name}
                  onValueChange={(value) =>
                    handleChangeContact(
                      value,
                      'last_name',
                      contact.contact_key as string
                    )
                  }
                  errorMessage={errors?.errors[`contacts.${index}.last_name`]}
                />
              </Element>

              <Element leftSide={t('email')} noExternalPadding>
                <InputField
                  id={`email_${index}`}
                  value={contact.email}
                  onValueChange={(value) =>
                    handleChangeContact(
                      value,
                      'email',
                      contact.contact_key as string
                    )
                  }
                  errorMessage={errors?.errors[`contacts.${index}.email`]}
                />
              </Element>

              <Element leftSide={t('phone')} noExternalPadding>
                <InputField
                  id={`phone_${index}`}
                  value={contact.phone}
                  onValueChange={(value) =>
                    handleChangeContact(
                      value,
                      'phone',
                      contact.contact_key as string
                    )
                  }
                  errorMessage={errors?.errors[`contacts.${index}.phone`]}
                />
              </Element>

              <Element noExternalPadding pushContentToRight>
                <div className="flex items-center">
                  {client?.contacts.length >= 2 && (
                    <Button
                      className="shadow-sm"
                      type="secondary"
                      behavior="button"
                      onClick={() => deleteContact(index)}
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
    </div>
  );
}
