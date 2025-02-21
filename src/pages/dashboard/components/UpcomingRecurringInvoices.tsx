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
import { route } from '$app/common/helpers/route';
import { Card } from '$app/components/cards';
import { Badge } from '$app/components/Badge';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { useDateTime } from '$app/common/hooks/useDateTime';
import { useTranslation } from 'react-i18next';
import { useGetSetting } from '$app/common/hooks/useGetSetting';
import { useGetTimezone } from '$app/common/hooks/useGetTimezone';
import { useColorScheme } from '$app/common/colors';
import { ArrowUp } from '$app/components/icons/ArrowUp';
import { ArrowDown } from '$app/components/icons/ArrowDown';
import { CalendarCheckOut } from '$app/components/icons/CalendarCheckOut';

export function UpcomingRecurringInvoices() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const getSetting = useGetSetting();
  const formatMoney = useFormatMoney();
  const getTimezone = useGetTimezone();
  const disableNavigation = useDisableNavigation();
  const dateTime = useDateTime({ withTimezone: true });

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
      format: (value, recurringInvoice) =>
        dateTime(
          value,
          '',
          '',
          getTimezone(getSetting(recurringInvoice.client, 'timezone_id'))
            .timeZone
        ),
    },
    {
      id: 'balance',
      label: t('amount'),
      format: (value, recurringInvoice) => (
        <Badge variant="blue" className="font-mono">
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
      title={
        <div className="flex items-center gap-2">
          <CalendarCheckOut size="1.4rem" color="#66B2FF" />

          <span>{t('upcoming_recurring_invoices')}</span>
        </div>
      }
      className="h-96 relative shadow-sm"
      headerClassName="px-3 sm:px-4 py-3 sm:py-4"
      withoutBodyPadding
      style={{ borderColor: colors.$5 }}
      headerStyle={{ borderColor: colors.$5 }}
      withoutHeaderPadding
    >
      <div className="px-4 pt-4">
        <DataTable
          resource="recurring_invoice"
          columns={columns}
          className="pr-4"
          endpoint="/api/v1/recurring_invoices?include=client&client_status=active&without_deleted_clients=true&per_page=50&page=1&sort=next_send_date_client|asc"
          withoutActions
          withoutPagination
          withoutPadding
          withoutPerPageAsPreference
          styleOptions={{
            addRowSeparator: true,
            withoutBottomBorder: true,
            withoutTopBorder: true,
            withoutLeftBorder: true,
            withoutRightBorder: true,
            disableThUppercase: true,
            withoutThVerticalPadding: true,
            useOnlyCurrentSortDirectionIcon: true,
            headerBackgroundColor: 'transparent',
            thChildrenClassName: 'text-gray-500',
            tdClassName: 'first:pl-2 py-3',
            thClassName: 'first:pl-2 py-3 border-r-0 text-sm',
            tBodyStyle: { border: 0 },
            thTextSize: 'small',
            thStyle: {
              borderBottom: `1px solid ${colors.$5}`,
            },
            rowSeparatorColor: colors.$5,
            ascIcon: <ArrowUp size="1.1rem" color="#6b7280" />,
            descIcon: <ArrowDown size="1.1rem" color="#6b7280" />,
          }}
          style={{
            height: '18.9rem',
          }}
        />
      </div>
    </Card>
  );
}
