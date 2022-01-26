/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from 'common/hooks/useQuery';
import { Client } from 'common/interfaces/client';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { Address } from '../edit/components/Address';
import { Details } from '../edit/components/Details';

export function Create() {
  const [t] = useTranslation();

  const pages: BreadcrumRecord[] = [
    { name: t('clients'), href: '/clients' },
    {
      name: t('new_client'),
      href: generatePath('/clients/create'),
    },
  ];

  const [client, setClient] = useState<Client | undefined>();

  const { data: blankClient, isLoading } = useQuery('/api/v1/clients/create', {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (blankClient?.data.data) {
      setClient(blankClient.data.data);
    }
  }, [blankClient]);

  const onSave = () => {};

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
          {/* <Contacts contacts={contacts} setContacts={setContacts} /> */}
          {/* <AdditionalInfo client={client} setClient={setClient} /> */}
        </div>
      </div>
    </Default>
  );
}
