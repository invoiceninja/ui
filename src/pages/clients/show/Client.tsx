/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { useClientQuery } from '$app/common/queries/clients';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
import { Tabs } from '$app/components/Tabs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import { Address } from './components/Address';
import { Contacts } from './components/Contacts';
import { Details } from './components/Details';
import { Standing } from './components/Standing';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { usePurgeClient } from '../common/hooks/usePurgeClient';
import { route } from '$app/common/helpers/route';
import { Gateways } from './components/Gateways';
import { ResourceActions } from '$app/components/ResourceActions';
import { useActions } from '../common/hooks/useActions';
import { MergeClientModal } from '../common/components/MergeClientModal';
import { Button } from '$app/components/forms';
import { useTabs } from './hooks/useTabs';
import { EmailHistory } from './components/EmailHistory';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

export default function Client() {
  const { documentTitle, setDocumentTitle } = useTitle('view_client');
  const { id } = useParams();
  const { data: client, isLoading } = useClientQuery({ id, enabled: true });

  const [t] = useTranslation();

  const hasPermission = useHasPermission();

  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false);

  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState<boolean>(false);

  useEffect(() => {
    setDocumentTitle(client?.display_name || 'view_client');
  }, [client]);

  const pages: Page[] = [
    { name: t('clients'), href: '/clients' },
    {
      name: documentTitle,
      href: route('/clients/:id', { id }),
    },
  ];

  const handlePurgeClient = usePurgeClient(id);

  const tabs = useTabs();

  const actions = useActions({
    setIsMergeModalOpen,
    setPasswordConfirmModalOpen,
  });

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={
        hasPermission('edit_client') && (
          <div className="flex space-x-3">
            <Button to={route('/clients/:id/edit', { id })}>
              {t('edit_client')}
            </Button>

            {client && (
              <ResourceActions
                label={t('more_actions')}
                resource={client}
                actions={actions}
              />
            )}
          </div>
        )
      }
    >
      {isLoading && <Spinner />}

      {client && (
        <>
          <div className="grid grid-cols-12 space-y-4 lg:space-y-0 lg:gap-4">
            <Details client={client} />
            <Address client={client} />
            <Contacts client={client} />
            <Standing client={client} />
            {client.gateway_tokens.length > 0 && <Gateways client={client} />}

            <EmailHistory />
          </div>

          <Tabs tabs={tabs} className="mt-6" />

          <div className="my-4">
            <Outlet />
          </div>
        </>
      )}

      {id && (
        <MergeClientModal
          visible={isMergeModalOpen}
          setVisible={setIsMergeModalOpen}
          mergeFromClientId={id}
          editPage
        />
      )}

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setPasswordConfirmModalOpen}
        onSave={handlePurgeClient}
      />
    </Default>
  );
}
