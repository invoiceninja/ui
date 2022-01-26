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
import { useTitle } from 'common/hooks/useTitle';
import { Client } from 'common/interfaces/client';
import { ClientContact } from 'common/interfaces/client-contact';
import { useClientQuery } from 'common/queries/clients';
import { defaultHeaders } from 'common/queries/common/headers';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { set } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { AdditionalInfo } from './components/AdditionalInfo';
import { Address } from './components/Address';
import { Contacts } from './components/Contacts';
import { Details } from './components/Details';

export function Edit() {
  const { documentTitle, setDocumentTitle } = useTitle('edit_client');
  const { id } = useParams();

  const [t] = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading } = useClientQuery(
    { id },
    { refetchOnWindowFocus: false }
  );

  const [contacts, setContacts] = useState<Partial<ClientContact>[]>([]);
  const [client, setClient] = useState<Client>();

  useEffect(() => {
    if (data?.data?.data) {
      setClient(data.data.data);
      setContacts(data.data.data.contacts);
    }
  }, [data]);

  useEffect(() => {
    setDocumentTitle(client?.display_name || 'edit_client');
  }, [client]);

  useEffect(() => {
    setClient((client) => set(client as Client, 'contacts', contacts));
  }, [contacts]);

  const pages: BreadcrumRecord[] = [
    { name: t('clients'), href: '/clients' },
    {
      name: documentTitle,
      href: generatePath('/clients/:id', { id }),
    },
  ];

  const onSave = () => {
    const toastId = toast.loading(t('processing'));

    axios
      .put(endpoint('/api/v1/clients/:id', { id }), client, {
        headers: defaultHeaders,
      })
      .then(() => {
        toast.success(t('updated_client'), { id: toastId });
      })
      .catch((error: AxiosError) => {
        console.error(error);

        toast.success(t('error_title'), { id: toastId });
      })
      .finally(() => navigate(generatePath('/clients/:id', { id })));
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick={generatePath('/clients/:id', { id })}
      onSaveClick={onSave}
    >
      {isLoading && <Spinner />}

      {client && (
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
      )}
    </Default>
  );
}
