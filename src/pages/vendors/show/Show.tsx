/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useVendorQuery } from 'common/queries/vendor';
import { Default } from 'components/layouts/Default';
import { Tab, Tabs } from 'components/Tabs';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';

export function Show() {
  const { id } = useParams();
  const { data: vendor } = useVendorQuery({ id });
  const [t] = useTranslation();
  const tabs: Tab[] = [
    { name: t('details'), href: generatePath('/vendors/:id/edit', { id }) },
    {
      name: t('expenses'),
      href: generatePath('/vendors/:id/expenses', { id }),
    },
    {
      name: t('recurring_expenses'),
      href: generatePath('/vendors/:id/recurring_expenses', { id }),
    },
    {
      name: t('documents'),
      href: generatePath('/vendors/:id/documents', { id }),
    },
  ];
  {
    console.log(vendor?.data.data);
  }
  return (
    <Default title={t('vendor')}>
      <Tabs tabs={tabs} className="mt-6" />
    </Default>
  );
}
