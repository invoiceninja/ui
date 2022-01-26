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
import { Tabs } from 'components/Tabs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Outlet, useParams } from 'react-router-dom';
import { Tab } from 'components/Tabs';
import { Dropdown } from 'components/dropdown/Dropdown';
import { Address } from './components/Address';
import { Contacts } from './components/Contacts';
import { Details } from './components/Details';
import { Standing } from './components/Standing';

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
    { name: t('invoices'), href: generatePath('/clients/:id', { id }) },
    { name: t('quotes'), href: generatePath('/clients/:id/quotes', { id }) },
    {
      name: t('payments'),
      href: generatePath('/clients/:id/payments', { id }),
    },
    {
      name: t('recurring_invoices'),
      href: generatePath('/clients/:id/recurring_invoices', { id }),
    },
    {
      name: t('credits'),
      href: generatePath('/clients/:id/credits', { id }),
    },
    {
      name: t('projects'),
      href: generatePath('/clients/:id/projects', { id }),
    },
    {
      name: t('tasks'),
      href: generatePath('/clients/:id/tasks', { id }),
    },
    {
      name: t('expenses'),
      href: generatePath('/clients/:id/expenses', { id }),
    },
    {
      name: t('recurring_expenses'),
      href: generatePath('/clients/:id/recurring_expenses', { id }),
    },
  ];

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      topRight={
        <div className="inline-flex items-center space-x-2">
          <Button to={generatePath('/clients/:id/edit', { id })}>
            {t('edit_client')}
          </Button>

          <Dropdown className="divide-y" label={t('more_actions')}></Dropdown>
        </div>
      }
    >
      {isLoading && <Spinner />}

      {client && (
        <>
          <div className="grid grid-cols-12 space-y-4 lg:space-y-0 lg:gap-4">
            <Details />
            <Address />
            <Contacts />
            <Standing />
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
