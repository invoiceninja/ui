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
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Tab } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface Params {
  purchaseOrder: PurchaseOrder | undefined;
}
export function useTabs(params: Params) {
  const [t] = useTranslation();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { id } = useParams();

  const { purchaseOrder } = params;

  const canEditAndView =
    hasPermission('view_purchase_order') ||
    hasPermission('edit_purchase_order') ||
    entityAssigned(purchaseOrder);

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/purchase_orders/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/purchase_orders/:id/documents', { id }),
      enabled: canEditAndView,
      formatName: () => (
        <DocumentsTabLabel
          numberOfDocuments={purchaseOrder?.documents?.length}
        />
      ),
    },
    {
      name: t('settings'),
      href: route('/purchase_orders/:id/settings', { id }),
    },
    {
      name: t('activity'),
      href: route('/purchase_orders/:id/activity', { id }),
    },
    {
      name: t('history'),
      href: route('/purchase_orders/:id/history', { id }),
    },
    {
      name: t('email_history'),
      href: route('/purchase_orders/:id/email_history', { id }),
    },
  ];

  return tabs;
}
