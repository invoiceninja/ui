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
import { Spinner } from 'components/Spinner';
import { Statistic } from 'components/Statistic';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';

export function Client() {
  const { documentTitle, setDocumentTitle } = useTitle('view_client');

  const [t] = useTranslation();
  const { id } = useParams();
  const { data: client, isLoading } = useClientQuery({ id });

  console.log(client);

  const pages: BreadcrumRecord[] = [
    { name: t('clients'), href: '/clients' },
    {
      name: documentTitle,
      href: generatePath('/clients/:id', { id }),
    },
  ];

  useEffect(() => {
    setDocumentTitle(client?.data?.data?.display_name || 'view_client');
  }, [client]);

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      {isLoading && <Spinner />}

      {client && (
        <>
          <div className="grid grid-cols-12 space-y-4 lg:space-y-0 lg:gap-4">
            <div className="col-span-12 lg:col-span-3">
              <Statistic
                title={t('paid_to_date')}
                value={client.data.data.paid_to_date}
              />
            </div>

            <div className="col-span-12 lg:col-span-3">
              <Statistic
                title={t('balance_due')}
                value={client.data.data.balance}
              />
            </div>
          </div>
        </>
      )}
    </Default>
  );
}
