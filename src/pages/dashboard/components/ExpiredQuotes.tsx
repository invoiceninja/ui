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
import { Quote } from '$app/common/interfaces/quote';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Badge } from '$app/components/Badge';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { useColorScheme } from '$app/common/colors';
import { ArrowUp } from '$app/components/icons/ArrowUp';
import { ArrowDown } from '$app/components/icons/ArrowDown';
import { CalendarClock } from '$app/components/icons/CalendarClock';

export function ExpiredQuotes() {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();

  const colors = useColorScheme();

  const disableNavigation = useDisableNavigation();

  const columns: DataTableColumns<Quote> = [
    {
      id: 'number',
      label: t('number'),
      format: (value, quote) => (
        <DynamicLink
          to={route('/quotes/:id/edit', { id: quote.id })}
          renderSpan={disableNavigation('quote', quote)}
        >
          {quote.number}
        </DynamicLink>
      ),
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (value, quote) => (
        <DynamicLink
          to={route('/clients/:id', { id: quote.client_id })}
          renderSpan={disableNavigation('client', quote.client)}
        >
          {quote.client?.display_name}
        </DynamicLink>
      ),
    },
    {
      id: 'date',
      label: t('date'),
      format: (value) => value && dayjs(value).format('MMM DD'),
    },
    {
      id: 'amount',
      label: t('amount'),
      format: (value, quote) => (
        <Badge variant="light-blue" className="font-mono">
          {formatMoney(
            value,
            quote.client?.country_id,
            quote.client?.settings.currency_id
          )}
        </Badge>
      ),
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <CalendarClock size="1.4rem" color="#F5B041" clockColor="#E74C3C" />

          <span>{t('expired_quotes')}</span>
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
          resource="quote"
          columns={columns}
          className="pr-4"
          endpoint="/api/v1/quotes?include=client&client_status=expired&without_deleted_clients=true&per_page=50&page=1&sort=id|desc"
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
