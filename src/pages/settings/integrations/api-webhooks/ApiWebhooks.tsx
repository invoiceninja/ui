/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { useTitle } from 'common/hooks/useTitle';
import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { ApiWebhook } from 'common/interfaces/api-webhook';
import { Link } from '@invoiceninja/forms';
import { route } from 'common/helpers/route';

export function ApiWebhooks() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
    { name: t('api_webhooks'), href: '/settings/integrations/api_webhooks' },
  ];

  useTitle('api_webhooks');

  const columns: DataTableColumns<ApiWebhook> = [
    {
      id: 'endpoint',
      label: t('endpoint'),
      format: (field, webhook) => (
        <Link
          to={route('/settings/integrations/api_webhooks/:id/edit', {
            id: webhook.id,
          })}
        >
          {webhook.target_url}
        </Link>
      ),
    },
    {
      id: 'method',
      label: t('method'),
      format: (field, webhook) => webhook.rest_method.toUpperCase(),
    },
  ];

  return (
    <Settings title={t('api_webhooks')} breadcrumbs={pages}>
      <DataTable
        resource="webhook"
        columns={columns}
        endpoint="/api/v1/webhooks"
        linkToCreate="/settings/integrations/api_webhooks/create"
        linkToEdit="/settings/integrations/api_webhooks/:id/edit"
        withResourcefulActions
      />
    </Settings>
  );
}
