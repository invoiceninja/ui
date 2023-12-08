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
import { Settings } from '$app/components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { DataTable } from '$app/components/DataTable';
import { useColumns } from './common/hooks/useColumns';

export function ApiWebhooks() {
  useTitle('api_webhooks');

  const [t] = useTranslation();
  const columns = useColumns();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
    { name: t('api_webhooks'), href: '/settings/integrations/api_webhooks' },
  ];

  return (
    <Settings title={t('api_webhooks')} breadcrumbs={pages}>
      <DataTable
        resource="webhook"
        columns={columns}
        endpoint="/api/v1/webhooks?sort=id|desc"
        bulkRoute="/api/v1/webhooks/bulk"
        linkToCreate="/settings/integrations/api_webhooks/create"
        linkToEdit="/settings/integrations/api_webhooks/:id/edit"
        withResourcefulActions
      />
    </Settings>
  );
}
