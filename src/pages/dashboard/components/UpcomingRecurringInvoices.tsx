/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { DataTable, DataTableColumns } from '$app/components/DataTable';
import { t } from 'i18next';
import { route } from '$app/common/helpers/route';
import { Card } from '$app/components/cards';
import { Badge } from '$app/components/Badge';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { useDateTime } from '$app/common/hooks/useDateTime';

export function UpcomingRecurringInvoices() {
  const dateTime = useDateTime();
  const formatMoney = useFormatMoney();
  const disableNavigation = useDisableNavigation();

  const columns: DataTableColumns<RecurringInvoice> = [
    {
      id: 'number',
      label: t('number'),
      format: (_, recurringInvoice) => {
        return (
          <DynamicLink
            to={route('/recurring_invoices/:id/edit', {
              id: recurringInvoice.id,
            })}
            renderSpan={disableNavigation(
              'recurring_invoice',
              recurringInvoice
            )}
          >
            {recurringInvoice.number}
          </DynamicLink>
        );
      },
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (_, recurringInvoice) => (
        <DynamicLink
          to={route('/clients/:id', { id: recurringInvoice.client_id })}
          renderSpan={disableNavigation('client', recurringInvoice.client)}
        >
          {recurringInvoice.client?.display_name}
        </DynamicLink>
      ),
    },
    {
      id: 'next_send_datetime',
      label: t('next_send_date'),
      format: (value) => dateTime(value),
    },
    {
      id: 'balance',
      label: t('balance'),
      format: (value, recurringInvoice) => (
        <Badge variant="red">
          {formatMoney(
            value,
            recurringInvoice.client?.country_id,
            recurringInvoice.client?.settings.currency_id
          )}
        </Badge>
      ),
    },
  ];

  return (
    <Card
      title={t('upcoming_recurring_invoices')}
      className="h-96 relative"
      withoutBodyPadding
      withoutHeaderBorder
    >
      <div className="pl-6 pr-4">
        <DataTable
          resource="recurring_invoice"
          columns={columns}
          className="pr-4"
          endpoint="/api/v1/recurring_invoices?include=client&client_status=active&without_deleted_clients=true&per_page=50&page=1&sort=next_send_date_client|asc"
          withoutActions
          withoutPagination
          withoutPadding
          styleOptions={{
            addRowSeparator: true,
            withoutBottomBorder: true,
            withoutTopBorder: true,
            withoutLeftBorder: true,
            withoutRightBorder: true,
            headerBackgroundColor: 'transparent',
            thChildrenClassName: 'text-gray-500 dark:text-white',
            tdClassName: 'first:pl-0 py-4',
            thClassName: 'first:pl-0',
            tBodyStyle: { border: 0 },
          }}
          style={{
            height: '19.9rem',
          }}
        />
      </div>
    </Card>
  );
}
