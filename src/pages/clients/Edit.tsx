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
import { useClientQuery } from 'common/queries/clients';
import { defaultHeaders } from 'common/queries/common/headers';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import {
  AdditionalInfo,
  Address,
  Contacts,
  Details,
} from './components/pages/edit';

export function Edit() {
  const { documentTitle, setDocumentTitle } = useTitle('edit_client');
  const [t] = useTranslation();
  const { id } = useParams();
  const { data, isLoading } = useClientQuery({ id }, { enabled: false });
  const [client, setClient] = useState<Client>();

  useEffect(() => {
    if (data?.data?.data) {
      setClient(data.data.data);
    }
  }, [data]);

  useEffect(() => {
    setDocumentTitle(client?.display_name || 'edit_client');
  }, [client]);

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
      });
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
        <div className="grid grid-cols-12 gap-4">
          <Details client={client} setClient={setClient} />
          <Contacts />
          <Address />
          <AdditionalInfo />
        </div>
      )}
    </Default>
  );
}
