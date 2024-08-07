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
import { Invoice } from '$app/common/interfaces/invoice';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Tab } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface Params {
  invoice: Invoice | undefined;
}
export function useTabs(params: Params) {
  const [t] = useTranslation();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { id } = useParams();

  const { invoice } = params;

  const canEditAndView =
    hasPermission('view_invoice') ||
    hasPermission('edit_invoice') ||
    entityAssigned(invoice);

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/invoices/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/invoices/:id/documents', { id }),
      enabled: canEditAndView,
      formatName: () => (
        <DocumentsTabLabel numberOfDocuments={invoice?.documents?.length} />
      ),
    },
    {
      name: t('settings'),
      href: route('/invoices/:id/settings', { id }),
    },
    {
      name: t('activity'),
      href: route('/invoices/:id/activity', { id }),
    },
    {
      name: t('history'),
      href: route('/invoices/:id/history', { id }),
    },
    {
      name: t('email_history'),
      href: route('/invoices/:id/email_history', { id }),
    },
  ];

  return tabs;
}
