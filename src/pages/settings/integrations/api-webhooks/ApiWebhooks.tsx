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
import { DataTable, DataTableColumns } from '$app/components/DataTable';
import { ApiWebhook } from '$app/common/interfaces/api-webhook';
import { Link } from '$app/components/forms';
import { route } from '$app/common/helpers/route';

export function ApiWebhooks() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
    { name: t('api_webhooks'), href: '/settings/integrations/api_webhooks' },
  ];

  useTitle('api_webhooks');

  const EVENT_CREATE_CLIENT = '1';
  const EVENT_CREATE_INVOICE = '2';
  const EVENT_CREATE_QUOTE = '3';
  const EVENT_CREATE_PAYMENT = '4';
  const EVENT_CREATE_VENDOR = '5';
  const EVENT_UPDATE_QUOTE = '6';
  const EVENT_DELETE_QUOTE = '7';
  const EVENT_UPDATE_INVOICE = '8';
  const EVENT_DELETE_INVOICE = '9';
  const EVENT_UPDATE_CLIENT = '10';
  const EVENT_DELETE_CLIENT = '11';
  const EVENT_DELETE_PAYMENT = '12';
  const EVENT_UPDATE_VENDOR = '13';
  const EVENT_DELETE_VENDOR = '14';
  const EVENT_CREATE_EXPENSE = '15';
  const EVENT_UPDATE_EXPENSE = '16';
  const EVENT_DELETE_EXPENSE = '17';
  const EVENT_CREATE_TASK = '18';
  const EVENT_UPDATE_TASK = '19';
  const EVENT_DELETE_TASK = '20';
  const EVENT_APPROVE_QUOTE = '21';
  const EVENT_LATE_INVOICE = '22';
  const EVENT_EXPIRED_QUOTE = '23';
  const EVENT_REMIND_INVOICE = '24';

  const events = [
    { event: EVENT_CREATE_CLIENT, label: t('create_client') },
    { event: EVENT_UPDATE_CLIENT, label: t('update_client') },
    { event: EVENT_DELETE_CLIENT, label: t('delete_client') },

    { event: EVENT_CREATE_INVOICE, label: t('create_invoice') },
    { event: EVENT_UPDATE_INVOICE, label: t('update_invoice') },
    { event: EVENT_LATE_INVOICE, label: t('late_invoice') },
    { event: EVENT_REMIND_INVOICE, label: t('remind_invoice') },
    { event: EVENT_DELETE_INVOICE, label: t('delete_invoice') },

    { event: EVENT_CREATE_QUOTE, label: t('create_quote') },
    { event: EVENT_UPDATE_QUOTE, label: t('update_quote') },
    { event: EVENT_APPROVE_QUOTE, label: t('approve_quote') },
    { event: EVENT_EXPIRED_QUOTE, label: t('expired_quote') },
    { event: EVENT_DELETE_QUOTE, label: t('delete_quote') },

    { event: EVENT_CREATE_PAYMENT, label: t('create_payment') },
    { event: EVENT_DELETE_PAYMENT, label: t('delete_payment') },

    { event: EVENT_CREATE_VENDOR, label: t('create_vendor') },
    { event: EVENT_UPDATE_VENDOR, label: t('update_vendor') },
    { event: EVENT_DELETE_VENDOR, label: t('delete_vendor') },

    { event: EVENT_CREATE_EXPENSE, label: t('create_expense') },
    { event: EVENT_UPDATE_EXPENSE, label: t('update_expense') },
    { event: EVENT_DELETE_EXPENSE, label: t('delete_expense') },

    { event: EVENT_CREATE_TASK, label: t('create_task') },
    { event: EVENT_UPDATE_TASK, label: t('update_task') },
    { event: EVENT_DELETE_TASK, label: t('delete_task') },
  ];

  const columns: DataTableColumns<ApiWebhook> = [
    {
      id: 'name',
      label: t('name'),
      format: (field, webhook) => events.find((event) => event.event === webhook.event_id)?.label,
    },
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
        endpoint="/api/v1/webhooks?sort=id|desc"
        bulkRoute="/api/v1/webhooks/bulk"
        linkToCreate="/settings/integrations/api_webhooks/create"
        linkToEdit="/settings/integrations/api_webhooks/:id/edit"
        withResourcefulActions
      />
    </Settings>
  );
}
