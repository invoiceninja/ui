/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Client } from '$app/common/interfaces/client';
import { ClientContact } from '$app/common/interfaces/client-contact';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankClientQuery } from '$app/common/queries/clients';
import { set } from 'lodash';
import { AdditionalInfo } from '$app/pages/clients/edit/components/AdditionalInfo';
import { Address } from '$app/pages/clients/edit/components/Address';
import { Contacts } from '$app/pages/clients/edit/components/Contacts';
import { Details } from '$app/pages/clients/edit/components/Details';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { Spinner } from '$app/components/Spinner';
import { toast } from '$app/common/helpers/toast/toast';
import { Slider } from '$app/components/cards/Slider';
import { Inline } from '$app/components/Inline';

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

  const queryClient = useQueryClient();

  const { data: blankClient } = useBlankClientQuery({
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (blankClient && isModalOpen) {
      setClient({ ...blankClient });
    }
  }, [isModalOpen]);

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

        queryClient.invalidateQueries('/api/v1/clients');
        queryClient.invalidateQueries(endpoint('/api/v1/clients'));

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

  return (
    <Slider
      title={t('new_client')!}
      visible={isModalOpen}
      onClose={() => handleClose(false)}
      size="regular"
      actionChildren={
        <Inline className="w-full flex justify-end">
          <Button type="secondary" onClick={() => handleClose(false)}>
            {t('cancel')}
          </Button>

          <Button onClick={onSave}>{t('save')}</Button>
        </Inline>
      }
    >
      {client ? (
        <div className="flex flex-col divide-y">
          <Details
            client={client}
            setClient={setClient}
            setErrors={setErrors}
            errors={errors}
          />

          <Contacts
            contacts={contacts}
            setContacts={setContacts}
            setErrors={setErrors}
            errors={errors}
          />

          <Address
            client={client}
            setClient={setClient}
            setErrors={setErrors}
            errors={errors}
          />

          <AdditionalInfo
            client={client}
            setClient={setClient}
            setErrors={setErrors}
            errors={errors}
          />
        </div>
      ) : (
        <Spinner />
      )}
    </Slider>
  );
}
