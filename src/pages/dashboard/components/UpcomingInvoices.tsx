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
import { Invoice } from '$app/common/interfaces/invoice';
import { Card } from '$app/components/cards';
import dayjs from 'dayjs';
import { Badge } from '$app/components/Badge';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { DynamicLink } from '$app/components/DynamicLink';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { ArrowUp } from '$app/components/icons/ArrowUp';
import { ArrowDown } from '$app/components/icons/ArrowDown';
import { CalendarCheckOut } from '$app/components/icons/CalendarCheckOut';

export function UpcomingInvoices() {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();

  const colors = useColorScheme();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const disableNavigation = useDisableNavigation();

  const columns: DataTableColumns<Invoice> = [
    {
      id: 'number',
      label: t('number'),
      format: (value, invoice) => {
        return (
          <DynamicLink
            to={route('/invoices/:id/edit', { id: invoice.id })}
            renderSpan={disableNavigation('invoice', invoice)}
          >
            {invoice.number}
          </DynamicLink>
        );
      },
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (value, invoice) => (
        <DynamicLink
          to={route('/clients/:id', { id: invoice.client_id })}
          renderSpan={disableNavigation('client', invoice.client)}
        >
          {invoice.client?.display_name}
        </DynamicLink>
      ),
    },
    {
      id: 'due_date',
      label: t('due_date'),
      format: (value, invoice) => {
        if (invoice.partial_due_date.length > 2)
          return dayjs(invoice.partial_due_date).format(dateFormat);
        else if (invoice.due_date.length > 2)
          return dayjs(invoice.due_date).format(dateFormat);
        else return '';
      },
    },
    {
      id: 'balance',
      label: t('balance'),
      format: (value, invoice) => (
        <Badge variant="blue" className="font-mono">
          {formatMoney(
            value,
            invoice.client?.country_id,
            invoice.client?.settings.currency_id
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

          <span>{t('upcoming_invoices')}</span>
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
          resource="invoice"
          columns={columns}
          className="pr-4"
          endpoint="/api/v1/invoices?include=client.group_settings&upcoming=true&without_deleted_clients=true&per_page=50&page=1"
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
          withoutSortQueryParameter
        />
      </div>
    </Card>
  );
}
