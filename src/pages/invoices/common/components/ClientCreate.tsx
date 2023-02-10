/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { Client } from 'common/interfaces/client';
import { ClientContact } from 'common/interfaces/client-contact';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useBlankClientQuery } from 'common/queries/clients';
import { Modal } from 'components/Modal';
import { set } from 'lodash';
import { AdditionalInfo } from 'pages/clients/edit/components/AdditionalInfo';
import { Address } from 'pages/clients/edit/components/Address';
import { Contacts } from 'pages/clients/edit/components/Contacts';
import { Details } from 'pages/clients/edit/components/Details';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClientCreated?: (client: Client) => unknown;
}

export function ClientCreate(props: Props) {
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

  const queryClient = useQueryClient();

  const { data: blankClient } = useBlankClientQuery({
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (blankClient) {
      setClient(blankClient);
    }
  }, [blankClient]);

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

    request('POST', endpoint('/api/v1/clients'), client)
      .then((response) => {
        toast.success(t('created_client'), { id: toastId });
        props.setIsModalOpen(false);

        props.onClientCreated && props.onClientCreated(response.data.data);

        queryClient.invalidateQueries('/api/v1/clients');

        window.dispatchEvent(
          new CustomEvent('invalidate.combobox.queries', {
            detail: {
              url: endpoint('/api/v1/clients'),
            },
          })
        );
      })
      .catch((error: AxiosError<ValidationBag>) => {
        console.error(error);

        if (error.response?.status === 422) {
          setErrors(error.response.data);
        }

        toast.error(t('error_title'), { id: toastId });
      });
  };

  return (
    <Modal
      title={t('new_client')}
      visible={props.isModalOpen}
      onClose={(value) => {
        props.setIsModalOpen(value);
        setErrors(undefined);
      }}
      size="large"
      backgroundColor="gray"
    >
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
        <Button type="minimal" onClick={() => props.setIsModalOpen(false)}>
          {t('cancel')}
        </Button>

        <Button onClick={onSave}>{t('save')}</Button>
      </div>
    </Modal>
  );
}
