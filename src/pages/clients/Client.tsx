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
import { useTitle } from 'common/hooks/useTitle';
import { useClientQuery } from 'common/queries/clients';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { Statistic } from 'components/Statistic';
import { Tabs } from 'components/Tabs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Outlet, useParams } from 'react-router-dom';
import { Tab } from 'components/Tabs';

export function Client() {
  const { documentTitle, setDocumentTitle } = useTitle('view_client');

  const [t] = useTranslation();
  const { id } = useParams();
  const { data: client, isLoading } = useClientQuery({ id });

  useEffect(() => {
    setDocumentTitle(client?.data?.data?.display_name || 'view_client');
  }, [client]);

  const pages: BreadcrumRecord[] = [
    { name: t('clients'), href: '/clients' },
    {
      name: documentTitle,
      href: generatePath('/clients/:id', { id }),
    },
  ];

  const tabs: Tab[] = [
    { name: t('overview'), href: generatePath('/clients/:id', { id }) },
    { name: t('details'), href: generatePath('/clients/:id/details', { id }) },
    {
      name: t('documents'),
      href: generatePath('/clients/:id/documents', { id }),
    },
    { name: t('ledger'), href: generatePath('/clients/:id/ledger', { id }) },
    {
      name: t('activity'),
      href: generatePath('/clients/:id/activity', { id }),
    },
    {
      name: t('system_logs'),
      href: generatePath('/clients/:id/system_logs', { id }),
    },
  ];

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      topRight={
        <Button to={generatePath('/clients/:id/edit', { id })}>
          {t('edit_client')}
        </Button>
      }
    >
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

          <Tabs tabs={tabs} className="mt-6" />

          <div className="my-4">
            <Outlet />
          </div>
        </>
      )}
    </Default>
  );
}
