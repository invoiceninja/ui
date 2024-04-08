/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, InputField } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Client } from '$app/common/interfaces/client';
import { ClientContact } from '$app/common/interfaces/client-contact';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankClientQuery } from '$app/common/queries/clients';
import { cloneDeep, set } from 'lodash';
import { AdditionalInfo } from '$app/pages/clients/edit/components/AdditionalInfo';
import { Address } from '$app/pages/clients/edit/components/Address';
import { Contacts } from '$app/pages/clients/edit/components/Contacts';
import { Details } from '$app/pages/clients/edit/components/Details';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '$app/components/Spinner';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Modal } from '$app/components/Modal';
import { CurrencySelector } from '$app/components/CurrencySelector';
import classNames from 'classnames';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClientCreated?: (client: Client) => unknown;
}

export function ClientCreate({
  isModalOpen,
  setIsModalOpen,
  onClientCreated,
}: Props) {
  const [t] = useTranslation();
  const [client, setClient] = useState<Client | undefined>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [contacts, setContacts] = useState<Partial<ClientContact>[]>([
    {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      send_email: false,
    },
  ]);
  const [fundamentalConceptVisible, setFundamentalConceptVisible] =
    useState<boolean>(true);

  const { data: blankClient } = useBlankClientQuery({
    refetchOnWindowFocus: false,
  });

  const handleChange = (property: keyof Client, value: string) => {
    setErrors(undefined);

    setClient((client) => client && set({ ...client }, property, value));
  };

  const handleContactsChange = (
    value: string | number | boolean,
    propertyId: string
  ) => {
    setErrors(undefined);

    const contactIndex = contacts.findIndex(
      (contact) => contact.contact_key === contacts[0].contact_key
    );

    set(contacts[contactIndex], propertyId, value);

    setContacts([...contacts]);
  };

  const handleClose = (value: boolean) => {
    setFundamentalConceptVisible(true);
    setIsModalOpen(value);
    setErrors(undefined);
    setClient(undefined);
    setContacts(() => [
      {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        send_email: false,
      },
    ]);
  };

  const onSave = () => {
    set(client as Client, 'contacts', contacts);
    toast.processing();
    setErrors(undefined);

    if (
      !(
        client?.name != '' ||
        contacts[0].first_name != '' ||
        contacts[0].last_name != ''
      )
    ) {
      setErrors({
        message: t('invalid_data //needs translation'),
        errors: { name: [t('please_enter_a_client_or_contact_name')] },
      });
      toast.error();

      return onSave;
    }

    request('POST', endpoint('/api/v1/clients'), client)
      .then((response) => {
        toast.success('created_client');

        onClientCreated && onClientCreated(response.data.data);

        $refetch(['clients']);

        window.dispatchEvent(
          new CustomEvent('invalidate.combobox.queries', {
            detail: {
              url: endpoint('/api/v1/clients'),
            },
          })
        );

        handleClose(false);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      });
  };

  useEffect(() => {
    if (blankClient && isModalOpen) {
      setClient({ ...blankClient });
    }
  }, [isModalOpen]);

  return (
    <Modal
      title={t('new_client')!}
      visible={isModalOpen}
      onClose={() => handleClose(false)}
      size={fundamentalConceptVisible ? 'extraSmall' : 'large'}
      renderTransitionChildAsFragment
      overflowVisible
    >
      <div className="flex flex-col space-y-7">
        {client ? (
          <>
            {fundamentalConceptVisible ? (
              <div className="flex flex-col space-y-3">
                <InputField
                  label={t('name')}
                  value={client?.name || ''}
                  onValueChange={(value) => handleChange('name', value)}
                  errorMessage={errors?.errors.name}
                />

                <InputField
                  label={`${t('contact')} ${t('first_name')}`}
                  value={contacts[0].first_name}
                  onValueChange={(value) =>
                    handleContactsChange(value, 'first_name')
                  }
                  errorMessage={errors?.errors.name}
                />

                <InputField
                  label={`${t('contact')} ${t('last_name')}`}
                  value={contacts[0].last_name}
                  onValueChange={(value) =>
                    handleContactsChange(value, 'last_name')
                  }
                  errorMessage={errors?.errors.name}
                />

                <InputField
                  label={`${t('contact')} ${t('email')}`}
                  value={contacts[0].email}
                  onValueChange={(value) =>
                    handleContactsChange(value, 'email')
                  }
                  errorMessage={errors?.errors['contacts.0.email']}
                />

                <InputField
                  label={`${t('contact')} ${t('phone')}`}
                  value={contacts[0].phone}
                  onValueChange={(value) =>
                    handleContactsChange(value, 'phone')
                  }
                  errorMessage={errors?.errors['contacts.0.phone']}
                />

                <CurrencySelector
                  label={t('currency')}
                  value={client?.settings?.currency_id || ''}
                  onChange={(value) => {
                    const $client = cloneDeep(client)!;
                    set($client, 'settings.currency_id', value);
                    setClient($client);
                  }}
                  errorMessage={errors?.errors['settings.currency_id']}
                  dismissable
                />
              </div>
            ) : (
              <div className="flex flex-col xl:flex-row xl:gap-4">
                <div className="w-full xl:w-1/2">
                  <Details
                    client={client}
                    setClient={setClient}
                    setErrors={setErrors}
                    errors={errors}
                  />

                  <div className="mt-5">
                    <Address
                      client={client}
                      setClient={setClient}
                      setErrors={setErrors}
                      errors={errors}
                    />
                  </div>
                </div>

                <div className="w-full xl:w-1/2">
                  <Contacts
                    contacts={contacts}
                    setContacts={setContacts}
                    setErrors={setErrors}
                    errors={errors}
                  />

                  <div className="mt-5">
                    <AdditionalInfo
                      client={client}
                      setClient={setClient}
                      setErrors={setErrors}
                      errors={errors}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <Spinner />
        )}

        <div
          className={classNames('flex', {
            'justify-between': fundamentalConceptVisible,
            'justify-end space-x-5': !fundamentalConceptVisible,
          })}
        >
          <Button
            behavior="button"
            type="secondary"
            onClick={() => setFundamentalConceptVisible((current) => !current)}
          >
            {fundamentalConceptVisible ? t('more_fields') : t('less_fields')}
          </Button>

          <Button behavior="button" onClick={onSave}>
            {t('save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
