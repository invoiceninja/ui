/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DataTable } from 'components/DataTable';
import { Settings } from 'components/layouts/Settings';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubscriptionColumns } from '../common/hooks/useSubscriptionColumns';

export function Subscriptions() {
  const [t] = useTranslation();

  const columns = useSubscriptionColumns();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('subscriptions'), href: '/settings/subscriptions' },
  ];

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('subscriptions')}`;
  });

  return (
    <Settings
      title={t('subscriptions')}
      docsLink="docs/advanced-settings/#subscriptions"
      breadcrumbs={pages}
    >
      <DataTable
        resource="subscription"
        endpoint="/api/v1/subscriptions"
        columns={columns}
        bulkRoute="/api/v1/subscriptions/bulk"
        linkToCreate="/settings/subscriptions/create"
        linkToEdit="/settings/subscriptions/:id/edit"
        withResourcefulActions
      />
    </Settings>
  );
}
