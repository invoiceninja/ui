/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { Credit } from '$app/common/interfaces/credit';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Tab } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface Params {
  credit: Credit | undefined;
}
export function useTabs(params: Params) {
  const [t] = useTranslation();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { id } = useParams();

  const { credit } = params;

  const canEditAndView =
    hasPermission('view_credit') ||
    hasPermission('edit_credit') ||
    entityAssigned(credit);

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/credits/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/credits/:id/documents', { id }),
      enabled: canEditAndView,
      formatName: () => (
        <DocumentsTabLabel numberOfDocuments={credit?.documents?.length} />
      ),
    },
    {
      name: t('settings'),
      href: route('/credits/:id/settings', { id }),
    },
    {
      name: t('activity'),
      href: route('/credits/:id/activity', { id }),
    },
    {
      name: t('history'),
      href: route('/credits/:id/history', { id }),
    },
  ];

  return tabs;
}
