/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ApiWebhook } from '$app/common/interfaces/api-webhook';
import { DataTableColumns } from '$app/components/DataTable';
import { useTranslation } from 'react-i18next';
import { Link } from '$app/components/forms';
import { route } from '$app/common/helpers/route';
import { useEvents } from './useEvents';

export function useColumns() {
  const [t] = useTranslation();

  const events = useEvents();

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
      format: (_, webhook) => webhook.rest_method.toUpperCase(),
    },
    {
      id: 'event_id',
      label: t('event_type'),
      format: (_, webhook) =>
        events.find(({ event }) => event === webhook.event_id)?.label || '',
    },
  ];

  return columns;
}
