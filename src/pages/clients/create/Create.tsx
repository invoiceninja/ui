/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { useQuery } from 'common/hooks/useQuery';
import { Client } from 'common/interfaces/client';
import { ClientContact } from 'common/interfaces/client-contact';
import { defaultHeaders } from 'common/queries/common/headers';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { set } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router-dom';
import { AdditionalInfo } from '../edit/components/AdditionalInfo';
import { Address } from '../edit/components/Address';
import { Contacts } from '../edit/components/Contacts';
import { Details } from '../edit/components/Details';

export function Create() {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const pages: BreadcrumRecord[] = [
    { name: t('clients'), href: '/clients' },
    {
      name: t('new_client'),
      href: generatePath('/clients/create'),
    },
  ];

  const [client, setClient] = useState<Client | undefined>();

  const [contacts, setContacts] = useState<Partial<ClientContact>[]>([
    {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      send_email: false,
    },
  ]);

  const { data: blankClient, isLoading } = useQuery('/api/v1/clients/create', {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (blankClient?.data.data) {
      setClient(blankClient.data.data);
    }
  }, [blankClient]);

  const onSave = () => {
    set(client as Client, 'contacts', contacts);

    const toastId = toast.loading(t('processing'));

    axios
      .post(endpoint('/api/v1/clients'), client, {
        headers: defaultHeaders,
      })
      .then((response) => {
        toast.success(t('created_client'), { id: toastId });

        navigate(generatePath('/clients/:id', { id: response.data.data.id }));
      })
      .catch((error: AxiosError) => {
        console.error(error);

        toast.success(t('error_title'), { id: toastId });
      });
  };

  return (
    <Default
      title={t('new_client')}
      breadcrumbs={pages}
      onSaveClick={onSave}
      onBackClick={generatePath('/clients')}
    >
      {isLoading && <Spinner />}

      <div className="flex flex-col xl:flex-row xl:gap-4">
        <div className="w-full xl:w-1/2">
          <Details client={client} setClient={setClient} />
          <Address client={client} setClient={setClient} />
        </div>

        <div className="w-full xl:w-1/2">
          <Contacts contacts={contacts} setContacts={setContacts} />
          <AdditionalInfo client={client} setClient={setClient} />
        </div>
      </div>
    </Default>
  );
}
