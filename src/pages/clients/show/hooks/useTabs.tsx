/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEnabled } from '$app/common/guards/guards/enabled';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { Tab } from '$app/components/Tabs';
import { modules } from '$app/pages/settings';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Client } from '$app/common/interfaces/client';
import { useQuery } from 'react-query';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';

interface Params {
  client: Client | undefined;
  isPurgeOrMergeActionCalled?: boolean;
}
export function useTabs(params: Params) {
  const [t] = useTranslation();

  const enabled = useEnabled();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { id } = useParams();
  const { client, isPurgeOrMergeActionCalled } = params;

  const { data: clientDocuments } = useQuery({
    queryKey: ['/api/v1/documents', id, 'client'],
    queryFn: () =>
      request('POST', endpoint('/api/v1/clients/:id/documents', { id })).then(
        (response) => response.data.data
      ),
    staleTime: Infinity,
    enabled: Boolean(id) && !isPurgeOrMergeActionCalled,
  });

  let tabs: Tab[] = [
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
    {
      name: t('activity'),
      href: route('/clients/:id/activities', { id }),
    },
    {
      name: t('documents'),
      href: route('/clients/:id/documents', { id }),
      enabled:
        hasPermission('view_client') ||
        hasPermission('edit_client') ||
        entityAssigned(client),
      formatName: () => (
        <DocumentsTabLabel numberOfDocuments={clientDocuments?.length} />
      ),
    },
  ];

  modules.forEach((module) => {
    if (!enabled(module.bitmask)) {
      tabs = tabs.filter((tab) => tab.name !== t(module.label));
    }
  });

  return tabs;
}
