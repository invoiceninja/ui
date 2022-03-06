/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Default } from 'components/layouts/Default';
import { Tab, Tabs } from 'components/Tabs';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';

export function Show() {
  const { id } = useParams();
  const [t] = useTranslation();
  const tabs: Tab[] = [
    { name: t('details'), href: generatePath('/vendors/:id', { id }) },
    {
      name: t('expenses'),
      href: generatePath('/vendors/:id/expenses', { id }),
    },
    {
      name: t('recurring_expenses'),
      href: generatePath('/vendors/:id/recurring_expenses', { id }),
    },
  ];

  return (
    <Default title={t('vendor')}>
      <Tabs tabs={tabs} className="mt-6" />
    </Default>
  );
}
