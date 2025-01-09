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
import { ReactNode } from 'react';

interface Props {
  topRight?: ReactNode;
  isEditMode: boolean;
}

export function ExpiredQuotes({ topRight, isEditMode }: Props) {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();

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
        <Badge variant="light-blue">
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
      title={t('expired_quotes')}
      className="relative"
      withoutBodyPadding
      withoutHeaderBorder
      height="full"
      topRight={topRight}
      renderFromShadcn
    >
      <div
        className="pl-6 pr-4 relative"
        style={{
          height: `calc(100% - ${!isEditMode ? '3.7rem' : '4.9rem'}`,
        }}
      >
        <DataTable
          resource="quote"
          columns={columns}
          className="pr-4"
          height="full"
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
            headerBackgroundColor: 'transparent',
            thChildrenClassName: 'text-gray-500 dark:text-white',
            tdClassName: 'first:pl-0 py-4',
            thClassName: 'first:pl-0',
            tBodyStyle: { border: 0 },
          }}
          withoutSortQueryParameter
        />
      </div>
    </Card>
  );
}
