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
import { useTitle } from 'common/hooks/useTitle';
import { useClientQuery } from 'common/queries/clients';
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { Tabs } from 'components/Tabs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import { Tab } from 'components/Tabs';
import { Address } from './components/Address';
import { Contacts } from './components/Contacts';
import { Details } from './components/Details';
import { Standing } from './components/Standing';
import { PasswordConfirmation } from 'components/PasswordConfirmation';
import { CustomResourcefulActions } from '../common/components/CustomResourcefulActions';
import { usePurgeClient } from '../common/hooks/usePurgeClient';
import { route } from 'common/helpers/route';
import { Gateways } from './components/Gateways';

export function Client() {
  const { documentTitle, setDocumentTitle } = useTitle('view_client');
  const { id } = useParams();
  const { data: client, isLoading } = useClientQuery({ id });

  const [t] = useTranslation();

  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState(false);

  useEffect(() => {
    setDocumentTitle(client?.data?.data?.display_name || 'view_client');
  }, [client]);

  const pages: Page[] = [
    { name: t('clients'), href: '/clients' },
    {
      name: documentTitle,
      href: route('/clients/:id', { id }),
    },
  ];

  const onSave = usePurgeClient(id);

  const tabs: Tab[] = [
    { name: t('invoices'), href: route('/clients/:id', { id }) },
    { name: t('quotes'), href: route('/clients/:id/quotes', { id }) },
    {
      name: t('payments'),
      href: route('/clients/:id/payments', { id }),
    },
    {
      name: t('recurring_invoices'),
      href: route('/clients/:id/recurring_invoices', { id }),
    },
    {
      name: t('credits'),
      href: route('/clients/:id/credits', { id }),
    },
    {
      name: t('projects'),
      href: route('/clients/:id/projects', { id }),
    },
    {
      name: t('tasks'),
      href: route('/clients/:id/tasks', { id }),
    },
    {
      name: t('expenses'),
      href: route('/clients/:id/expenses', { id }),
    },
    {
      name: t('recurring_expenses'),
      href: route('/clients/:id/recurring_expenses', { id }),
    },
  ];

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      topRight={
        <div className="inline-flex items-center space-x-2">
          <Button to={route('/clients/:id/edit', { id })}>
            {t('edit_client')}
          </Button>
          <CustomResourcefulActions
            clientId={id}
            openPurgeModal={setPasswordConfirmModalOpen}
          />
        </div>
      }
    >
      {isLoading && <Spinner />}

      {client && (
        <>
          <div className="grid grid-cols-12 space-y-4 lg:space-y-0 lg:gap-4">
            <Details client={client.data.data} />
            <Address client={client.data.data} />
            <Contacts client={client.data.data} />
            <Standing client={client.data.data} />
            {client.data.data.gateway_tokens.length > 0 && (
              <Gateways client={client.data.data} />
            )}
          </div>

          <Tabs tabs={tabs} className="mt-6" />

          <div className="my-4">
            <Outlet />
          </div>
        </>
      )}
      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setPasswordConfirmModalOpen}
        onSave={onSave}
      />
    </Default>
  );
}
