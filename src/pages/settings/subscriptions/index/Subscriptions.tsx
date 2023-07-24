/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { DataTable } from '$app/components/DataTable';
import { Settings } from '$app/components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { useSubscriptionColumns } from '../common/hooks/useSubscriptionColumns';

export function Subscriptions() {
  const { documentTitle } = useTitle('payment_links');

  const [t] = useTranslation();

  const columns = useSubscriptionColumns();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('payment_links'), href: '/settings/subscriptions' },
  ];

  return (
    <Settings
      title={documentTitle}
      docsLink="en/advanced-settings/#subscriptions"
      breadcrumbs={pages}
      withoutBackButton
    >
      <DataTable
        resource="payment_link"
        endpoint="/api/v1/subscriptions?sort=id|desc"
        bulkRoute="/api/v1/subscriptions/bulk"
        columns={columns}
        linkToCreate="/settings/subscriptions/create"
        linkToEdit="/settings/subscriptions/:id/edit"
        withResourcefulActions
      />
    </Settings>
  );
}
