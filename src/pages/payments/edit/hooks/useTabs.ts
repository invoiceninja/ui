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
import { Payment } from '$app/common/interfaces/payment';
import { Tab } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface Params {
  payment: Payment | undefined;
}
export function useTabs(params: Params) {
  const [t] = useTranslation();

  const { id } = useParams();

  const { payment } = params;

  let tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/payments/:id/edit', { id }),
    },
    {
      name: t('apply'),
      href: route('/payments/:id/apply', { id }),
    },
    {
      name: t('refund'),
      href: route('/payments/:id/refund', { id }),
    },
    {
      name: t('documents'),
      href: route('/payments/:id/documents', { id }),
    },
    {
      name: t('custom_fields'),
      href: route('/payments/:id/payment_fields', { id }),
    },
  ];

  if (payment && payment.amount - payment.applied > 0 && !payment.is_deleted) {
    console.log('ok');
    tabs = tabs.filter(({ name }) => name !== t('apply'));
  }

  if (payment && payment.amount !== payment.refunded && !payment.is_deleted) {
    tabs = tabs.filter(({ name }) => name !== t('refund'));
  }

  return tabs;
}
