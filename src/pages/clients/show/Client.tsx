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
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { Address } from './components/Address';
import { Contacts } from './components/Contacts';
import { Details } from './components/Details';
import { Standing } from './components/Standing';
import { route } from '$app/common/helpers/route';
import { Gateways } from './components/Gateways';
import { ResourceActions } from '$app/components/ResourceActions';
import { useActions } from '../common/hooks/useActions';
import { useTabs } from './hooks/useTabs';
import { EmailHistory } from './components/EmailHistory';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { Client as IClient } from '$app/common/interfaces/client';
import { ClientPublicNotes } from './components/ClientPublicNotes';
import { ClientPrivateNotes } from './components/ClientPrivateNotes';
import { useSocketEvent } from '$app/common/queries/sockets';
import { $refetch } from '$app/common/hooks/useRefetch';
import { PreviousNextNavigation } from '$app/components/PreviousNextNavigation';

export default function Client() {
  const { documentTitle, setDocumentTitle } = useTitle('view_client');
  const [t] = useTranslation();

  const [isPurgeOrMergeActionCalled, setIsPurgeOrMergeActionCalled] =
    useState<boolean>(false);

  const { id } = useParams();
  const { data: client, isLoading } = useClientQuery({
    id,
    enabled: Boolean(id) && !isPurgeOrMergeActionCalled,
  });

  const pages: Page[] = [
    { name: t('clients'), href: '/clients' },
    {
      name: documentTitle,
      href: route('/clients/:id', { id }),
    },
  ];

  const tabs = useTabs({
    client,
  });
  const actions = useActions({
    setIsPurgeOrMergeActionCalled,
  });

  const navigate = useNavigate();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  useEffect(() => {
    setDocumentTitle(client?.display_name || 'view_client');

    return () => {
      setIsPurgeOrMergeActionCalled(false);
    };
  }, [client]);

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
    changeTemplateEntityContext,
  } = useChangeTemplate();

  useSocketEvent({
    on: 'App\\Events\\Invoice\\InvoiceWasPaid',
    callback: () => $refetch(['invoices']),
  });

  useSocketEvent({
    on: 'App\\Events\\Payment\\PaymentWasUpdated',
    callback: () => $refetch(['payments']),
  });

  useSocketEvent({
    on: [
      'App\\Events\\Credit\\CreditWasCreated',
      'App\\Events\\Credit\\CreditWasUpdated',
    ],
    callback: () => $refetch(['credits']),
  });

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={
        client &&
        (hasPermission('edit_client') || entityAssigned(client)) && (
          <ResourceActions
            resource={client}
            actions={actions}
            saveButtonLabel={t('edit')}
            onSaveClick={() => navigate(route('/clients/:id/edit', { id }))}
            cypressRef="clientActionDropdown"
          />
        )
      }
      afterBreadcrumbs={<PreviousNextNavigation entity="client" />}
    >
      {isLoading && <Spinner />}

      {client && (
        <>
          <div className="grid grid-cols-12 lg:space-y-0 gap-4">
            <Details client={client} />
            <Address client={client} />
            <Contacts client={client} />
            <Standing client={client} />
            {client.gateway_tokens.length > 0 && <Gateways client={client} />}
            <EmailHistory />
            <ClientPublicNotes client={client} />
            <ClientPrivateNotes client={client} />
          </div>

          <Tabs tabs={tabs} className="mt-6" />

          <div className="my-4">
            <Outlet
              context={{
                isPurgeOrMergeActionCalled,
                displayName: client.display_name,
              }}
            />
          </div>

          <ChangeTemplateModal<IClient>
            entity={changeTemplateEntityContext?.entity ?? 'client'}
            entities={changeTemplateResources as IClient[]}
            visible={changeTemplateVisible}
            setVisible={setChangeTemplateVisible}
            labelFn={(client) => `${t('number')}: ${client.number}`}
            bulkUrl={
              changeTemplateEntityContext?.endpoint ?? '/api/v1/clients/bulk'
            }
          />
        </>
      )}
    </Default>
  );
}
