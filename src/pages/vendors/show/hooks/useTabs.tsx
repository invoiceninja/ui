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
import { Tab } from '$app/components/Tabs';
import { modules } from '$app/pages/settings';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function useTabs() {
  const [t] = useTranslation();
  const enabled = useEnabled();

  const { id } = useParams();

  let tabs: Tab[] = [
    {
      name: t('purchase_orders'),
      href: route('/vendors/:id', { id }),
    },
    {
      name: t('expenses'),
      href: route('/vendors/:id/expenses', { id }),
    },
    {
      name: t('recurring_expenses'),
      href: route('/vendors/:id/recurring_expenses', { id }),
    },
    {
      name: t('documents'),
      href: route('/vendors/:id/documents', { id }),
    },
  ];

  modules.forEach((module) => {
    if (!enabled(module.bitmask)) {
      tabs = tabs.filter((tab) => tab.name !== t(module.label));
    }
  });

  return tabs;
}
