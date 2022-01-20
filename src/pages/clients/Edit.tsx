/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { useClientQuery } from 'common/queries/clients';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useEffect } from 'react';
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
  const { data: client } = useClientQuery({ id });

  useEffect(() => {
    setDocumentTitle(client?.data?.data?.display_name || 'edit_client');
  }, [client]);

  const pages: BreadcrumRecord[] = [
    { name: t('clients'), href: '/clients' },
    {
      name: documentTitle,
      href: generatePath('/clients/:id', { id }),
    },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <div className="grid grid-cols-12 gap-4">
        <Details />
        <Contacts />
        <Address />
        <AdditionalInfo />
      </div>
    </Default>
  );
}
