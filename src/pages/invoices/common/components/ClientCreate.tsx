/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { useQuery } from 'common/hooks/useQuery';
import { Client } from 'common/interfaces/client';
import { ClientContact } from 'common/interfaces/client-contact';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { defaultHeaders } from 'common/queries/common/headers';
import { Modal } from 'components/Modal';
import { ValidationAlert } from 'components/ValidationAlert';
import { set } from 'lodash';
import { AdditionalInfo } from 'pages/clients/edit/components/AdditionalInfo';
import { Address } from 'pages/clients/edit/components/Address';
import { Contacts } from 'pages/clients/edit/components/Contacts';
import { Details } from 'pages/clients/edit/components/Details';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useSetCurrentInvoiceProperty } from '../hooks/useSetCurrentInvoiceProperty';

export function ClientCreate() {
  const [t] = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [client, setClient] = useState<Client | undefined>();
  const [errors, setErrors] = useState<ValidationBag>();
  const onChange = useSetCurrentInvoiceProperty();
  const [contacts, setContacts] = useState<Partial<ClientContact>[]>([
    {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      send_email: false,
    },
  ]);

  const queryClient = useQueryClient();

  const { data: blankClient } = useQuery('/api/v1/clients/create', {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (blankClient?.data.data) {
      setClient(blankClient.data.data);
    }
  }, [blankClient]);

  useEffect(() => {
    if (!isModalOpen) {
      queryClient.invalidateQueries('/api/v1/clients/create');
    }
  }, [isModalOpen]);

  const onSave = () => {
    set(client as Client, 'contacts', contacts);
    const toastId = toast.loading(t('processing'));
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
      toast.error(t('error_title'), { id: toastId });

      return onSave;
    }

    axios
      .post(endpoint('/api/v1/clients'), client, {
        headers: defaultHeaders,
      })
      .then((response) => {
        toast.success(t('created_client'), { id: toastId });
        console.log(response.data.data.id)
        onChange('client_id', response.data.data.id);
        setIsModalOpen(false);
      })
      .catch((error: AxiosError) => {
        console.error(error);

        if (error.response?.status === 422) {
          setErrors(error.response.data);
        }

        toast.error(t('error_title'), { id: toastId });
      });
  };

  return (
    <>
      <Modal
        title={t('new_client')}
        visible={isModalOpen}
        onClose={(value) => {
          setIsModalOpen(value);
          setErrors(undefined);
        }}
        size="large"
        backgroundColor="gray"
      >
        {errors && <ValidationAlert errors={errors} />}

        <div className="flex flex-col xl:flex-row xl:gap-4">
          <div className="w-full xl:w-1/2">
            <Details client={client} setClient={setClient} errors={errors} />
            <Address client={client} setClient={setClient} />
          </div>

          <div className="w-full xl:w-1/2">
            <Contacts
              contacts={contacts}
              setContacts={setContacts}
              errors={errors}
            />
            <AdditionalInfo client={client} setClient={setClient} />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="minimal" onClick={() => setIsModalOpen(false)}>
            {t('cancel')}
          </Button>

          <Button onClick={onSave}>{t('save')}</Button>
        </div>
      </Modal>

      <Button
        behavior="button"
        type="minimal"
        onClick={() => setIsModalOpen(true)}
      >
        {t('new_client')}
      </Button>
    </>
  );
}
