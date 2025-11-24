/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, InputField, SelectField } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Client } from '$app/common/interfaces/client';
import { ClientContact } from '$app/common/interfaces/client-contact';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankClientQuery } from '$app/common/queries/clients';
import { cloneDeep, set } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '$app/components/Spinner';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Modal } from '$app/components/Modal';
import { CurrencySelector } from '$app/components/CurrencySelector';
import { TabGroup } from '$app/components/TabGroup';
import { CountrySelector } from '$app/components/CountrySelector';
import { LanguageSelector } from '$app/components/LanguageSelector';
import { PaymentTerm } from '$app/common/interfaces/payment-term';
import { usePaymentTermsQuery } from '$app/common/queries/payment-terms';
import { NumberInputField } from '$app/components/forms/NumberInputField';

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

  const { data: blankClient } = useBlankClientQuery({
    refetchOnWindowFocus: false,
  });

  const { data: paymentTermsResponse } = usePaymentTermsQuery({});

  const handleChange = (property: keyof Client, value: string) => {
    setErrors(undefined);

    setClient((client) => client && set({ ...client }, property, value));
  };

  const handleSettingsChange = (
    property: keyof Client['settings'],
    value: string | number | boolean
  ) => {
    setErrors(undefined);

    setClient(
      (client) =>
        client &&
        set({ ...client }, 'settings', {
          ...client.settings,
          [property]: value,
        })
    );
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

        handleClose(false);

        $refetch(['clients']);

        window.dispatchEvent(
          new CustomEvent('invalidate.combobox.queries', {
            detail: {
              url: endpoint('/api/v1/clients'),
            },
          })
        );
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
      size="extraSmall"
      renderTransitionChildAsFragment
      overflowVisible
      withoutVerticalMargin
      withoutHorizontalPadding
      withoutBorderLine
    >
      <div className="flex flex-col">
        {client ? (
          <TabGroup
            tabs={[t('details'), t('billing'), t('shipping'), t('settings')]}
            width="full"
            withHorizontalPadding
            horizontalPaddingWidth="1.5rem"
          >
            <div className="flex flex-col space-y-3 px-4 sm:px-6">
              <InputField
                label={t('name')}
                value={client?.name || ''}
                onValueChange={(value) => handleChange('name', value)}
                errorMessage={errors?.errors.name || errors?.errors.id}
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
                onValueChange={(value) => handleContactsChange(value, 'email')}
                errorMessage={errors?.errors['contacts.0.email']}
              />

              <InputField
                label={`${t('contact')} ${t('phone')}`}
                value={contacts[0].phone}
                onValueChange={(value) => handleContactsChange(value, 'phone')}
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

            <div className="flex flex-col space-y-3 px-4 sm:px-6">
              <InputField
                label={t('billing_address1')}
                value={client?.address1 || ''}
                onValueChange={(value) => handleChange('address1', value)}
                errorMessage={errors?.errors.address1}
              />

              <InputField
                label={t('address2')}
                value={client?.address2 || ''}
                onValueChange={(value) => handleChange('address2', value)}
                errorMessage={errors?.errors.address2}
              />

              <InputField
                label={t('city')}
                value={client?.city || ''}
                onValueChange={(value) => handleChange('city', value)}
                errorMessage={errors?.errors.city}
              />

              <InputField
                label={t('state')}
                value={client?.state || ''}
                onValueChange={(value) => handleChange('state', value)}
                errorMessage={errors?.errors.state}
              />

              <InputField
                label={t('postal_code')}
                value={client?.postal_code || ''}
                onValueChange={(value) => handleChange('postal_code', value)}
                errorMessage={errors?.errors.postal_code}
              />

              <CountrySelector
                label={t('country')}
                value={client?.country_id || ''}
                onChange={(value) => handleChange('country_id', value)}
                errorMessage={errors?.errors.country_id}
                dismissable
              />
            </div>

            <div className="flex flex-col space-y-3 px-4 sm:px-6">
              <InputField
                label={t('shipping_address1')}
                value={client?.shipping_address1 || ''}
                onValueChange={(value) =>
                  handleChange('shipping_address1', value)
                }
                errorMessage={errors?.errors.shipping_address1}
              />

              <InputField
                label={t('shipping_address2')}
                value={client?.shipping_address2 || ''}
                onValueChange={(value) =>
                  handleChange('shipping_address2', value)
                }
                errorMessage={errors?.errors.shipping_address2}
              />

              <InputField
                label={t('city')}
                value={client?.shipping_city || ''}
                onValueChange={(value) => handleChange('shipping_city', value)}
                errorMessage={errors?.errors.shipping_city}
              />

              <InputField
                label={t('state')}
                value={client?.shipping_state || ''}
                onValueChange={(value) => handleChange('shipping_state', value)}
                errorMessage={errors?.errors.shipping_state}
              />

              <InputField
                label={t('postal_code')}
                value={client?.shipping_postal_code || ''}
                onValueChange={(value) =>
                  handleChange('shipping_postal_code', value)
                }
                errorMessage={errors?.errors.shipping_postal_code}
              />

              <CountrySelector
                label={t('country')}
                value={client?.shipping_country_id || ''}
                onChange={(value) => handleChange('shipping_country_id', value)}
                errorMessage={errors?.errors.shipping_country_id}
                dismissable
              />
            </div>

            <div className="flex flex-col space-y-3 px-4 sm:px-6">
              <CurrencySelector
                label={t('currency')}
                value={client?.settings?.currency_id || ''}
                onChange={(value) => handleSettingsChange('currency_id', value)}
                errorMessage={errors?.errors['settings.currency_id']}
              />

              <LanguageSelector
                label={t('language')}
                value={client?.settings?.language_id || ''}
                onChange={(value) => handleSettingsChange('language_id', value)}
                errorMessage={errors?.errors['settings.language_id']}
              />

              {paymentTermsResponse && (
                <SelectField
                  label={t('payment_terms')}
                  value={client?.settings?.payment_terms || ''}
                  errorMessage={errors?.errors['settings.payment_terms']}
                  onValueChange={(value) =>
                    handleSettingsChange('payment_terms', value)
                  }
                  withBlank
                  customSelector
                >
                  {paymentTermsResponse.data.data.map(
                    (paymentTerm: PaymentTerm, index: number) => (
                      <option
                        key={index}
                        value={paymentTerm.num_days.toString()}
                      >
                        {paymentTerm.name}
                      </option>
                    )
                  )}
                </SelectField>
              )}

              {paymentTermsResponse && (
                <SelectField
                  label={t('quote_valid_until')}
                  value={client?.settings?.valid_until || ''}
                  onValueChange={(value) =>
                    handleSettingsChange('valid_until', value)
                  }
                  errorMessage={errors?.errors['settings.valid_until']}
                  withBlank
                  customSelector
                >
                  {paymentTermsResponse.data.data.map(
                    (paymentTerm: PaymentTerm, index: number) => (
                      <option
                        key={index}
                        value={paymentTerm.num_days.toString()}
                      >
                        {paymentTerm.name}
                      </option>
                    )
                  )}
                </SelectField>
              )}

              <NumberInputField
                label={t('task_rate')}
                value={client?.settings?.default_task_rate || ''}
                onValueChange={(value) =>
                  handleSettingsChange('default_task_rate', parseFloat(value))
                }
                errorMessage={errors?.errors['settings.default_task_rate']}
              />

              <SelectField
                label={t('send_reminders')}
                value={
                  client?.settings?.send_reminders === true
                    ? 'enabled'
                    : client?.settings?.send_reminders === false
                    ? 'disabled'
                    : ''
                }
                onValueChange={(value) =>
                  handleSettingsChange(
                    'send_reminders',
                    value === 'enabled' ? true : value === '' ? '' : false
                  )
                }
                withBlank
                errorMessage={errors?.errors['settings.send_reminders']}
                customSelector
              >
                <option value="enabled">{t('enabled')}</option>
                <option value="disabled">{t('disabled')}</option>
              </SelectField>
            </div>
          </TabGroup>
        ) : (
          <Spinner />
        )}

        <div className="flex justify-end mt-2 px-4 sm:px-6">
          <Button behavior="button" onClick={onSave}>
            {t('save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
