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
import {
  useAdmin,
  useHasPermission,
} from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { Payment } from '$app/common/interfaces/payment';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Tab } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface Params {
  payment: Payment | undefined;
}
export function useTabs(params: Params) {
  const [t] = useTranslation();

  const { isAdmin, isOwner } = useAdmin();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { id } = useParams();

  const { payment } = params;

  const canOnlyEdit = hasPermission('edit_payment') || entityAssigned(payment);

  const canEditAndView =
    hasPermission('view_payment') ||
    hasPermission('edit_payment') ||
    entityAssigned(payment);

  let tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/payments/:id/edit', { id }),
    },
    {
      name: t('apply'),
      href: route('/payments/:id/apply', { id }),
      enabled: canOnlyEdit,
    },
    {
      name: t('refund'),
      href: route('/payments/:id/refund', { id }),
      enabled: canOnlyEdit,
    },
    {
      name: t('documents'),
      href: route('/payments/:id/documents', { id }),
      enabled: canEditAndView,
      formatName: () => (
        <DocumentsTabLabel numberOfDocuments={payment?.documents?.length} />
      ),
    },
    {
      name: t('custom_fields'),
      href: route('/payments/:id/payment_fields', { id }),
      enabled: isAdmin || isOwner,
    },
  ];

  if (payment) {
    if (!(payment.amount - payment.applied > 0 && !payment.is_deleted)) {
      tabs = tabs.filter(({ name }) => name !== t('apply'));
    }

    if (!(payment.amount !== payment.refunded && !payment.is_deleted)) {
      tabs = tabs.filter(({ name }) => name !== t('refund'));
    }
  }

  return tabs;
}
