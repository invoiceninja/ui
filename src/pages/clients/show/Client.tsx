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
import { Contacts } from './components/Contacts';
import { Details } from './components/Details';
import { Standing } from './components/Standing';
import { route } from '$app/common/helpers/route';
import { Gateways } from './components/Gateways';
import { ResourceActions } from '$app/components/ResourceActions';
import { useActions } from '../common/hooks/useActions';
import { useTabs } from './hooks/useTabs';
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
import { InputLabel } from '$app/components/forms';
import { Address } from './components/Address';
import CardsCustomizationModal, {
  ClientShowCard,
} from './components/CardsCustomizationModal';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

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

  const reactSettings = useReactSettings();

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

  const isCardVisible = (card: ClientShowCard) => {
    const currentCards = reactSettings.client_show_cards || [
      'details',
      'address',
      'contacts',
      'standing',
    ];

    return currentCards.includes(card);
  };

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
      afterBreadcrumbs={
        <div className="flex flex-1 justify-end items-center gap-2">
          <PreviousNextNavigation entity="client" />

          <CardsCustomizationModal />
        </div>
      }
    >
      {isLoading && <Spinner />}

      {client && (
        <>
          <div className="grid grid-cols-12 lg:space-y-0 gap-4">
            {isCardVisible('details') && <Details client={client} />}
            {isCardVisible('address') && <Address client={client} />}
            {isCardVisible('contacts') && <Contacts client={client} />}
            {isCardVisible('standing') && <Standing client={client} />}
            {isCardVisible('gateways') && client.gateway_tokens.length > 0 && (
              <Gateways client={client} />
            )}
            {isCardVisible('public_notes') && (
              <ClientPublicNotes client={client} />
            )}
            {isCardVisible('private_notes') && (
              <ClientPrivateNotes client={client} />
            )}
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
            labelFn={(client) => (
              <div className="flex flex-col space-y-1">
                <InputLabel>{t('number')}</InputLabel>

                <span>{client.number}</span>
              </div>
            )}
            bulkUrl={
              changeTemplateEntityContext?.endpoint ?? '/api/v1/clients/bulk'
            }
          />
        </>
      )}
    </Default>
  );
}
