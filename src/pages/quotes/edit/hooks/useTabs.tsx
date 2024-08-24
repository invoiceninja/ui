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
import { Quote } from '$app/common/interfaces/quote';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Tab } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface Params {
  quote: Quote | undefined;
}
export function useTabs(params: Params) {
  const [t] = useTranslation();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { id } = useParams();

  const { quote } = params;

  const canEditAndView =
    hasPermission('view_quote') ||
    hasPermission('edit_quote') ||
    entityAssigned(quote);

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/quotes/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/quotes/:id/documents', { id }),
      enabled: canEditAndView,
      formatName: () => (
        <DocumentsTabLabel numberOfDocuments={quote?.documents?.length} />
      ),
    },
    {
      name: t('settings'),
      href: route('/quotes/:id/settings', { id }),
    },
    {
      name: t('activity'),
      href: route('/quotes/:id/activity', { id }),
    },
    {
      name: t('history'),
      href: route('/quotes/:id/history', { id }),
    },
    {
      name: t('email_history'),
      href: route('/quotes/:id/email_history', { id }),
    },
  ];

  return tabs;
}
