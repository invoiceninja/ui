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
import { Payment } from '$app/common/interfaces/payment';
import { Card } from '$app/components/cards';
import { generatePath } from 'react-router-dom';
import { Badge } from '$app/components/Badge';
import { date } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { Button } from '$app/components/forms';
import { useState } from 'react';

export function RecentPayments() {
  const formatMoney = useFormatMoney();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const disableNavigation = useDisableNavigation();

  const [filter, setFilter] = useState<'filter_1' | 'filter_2'>();

  const columns: DataTableColumns<Payment> = [
    {
      id: 'number',
      label: t('number'),
      format: (value, payment) => {
        return (
          <DynamicLink
            to={route('/payments/:id/edit', { id: payment.id })}
            renderSpan={disableNavigation('payment', payment)}
          >
            {payment.number}
          </DynamicLink>
        );
      },
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (value, payment) => (
        <DynamicLink
          to={route('/clients/:id', { id: payment.client_id })}
          renderSpan={disableNavigation('client', payment.client)}
        >
          {payment.client?.display_name}
        </DynamicLink>
      ),
    },
    {
      id: 'invoice_number',
      label: t('invoice'),
      format: (value, payment) =>
        payment.invoices &&
        payment.invoices[0] && (
          <DynamicLink
            to={generatePath('/invoices/:id/edit', {
              id: payment.invoices[0].id,
            })}
            renderSpan={disableNavigation('invoice', payment.invoices[0])}
          >
            {payment.invoices[0].number}
          </DynamicLink>
        ),
    },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'amount',
      label: t('amount'),
      format: (value, payment) => (
        <Badge variant="green">
          {formatMoney(
            value,
            payment.client?.country_id,
            payment.client?.settings.currency_id
          )}
        </Badge>
      ),
    },
  ];

  return (
    <Card
      title={t('recent_payments')}
      className="h-96 relative"
      withoutBodyPadding
      topRight={
        <div className="flex space-x-3">
          <Button
            behavior="button"
            type="minimal"
            onClick={() => setFilter(undefined)}
            minimalTypePadding
          >
            {t('both')}
          </Button>

          <Button
            behavior="button"
            type={filter === 'filter_1' ? 'primary' : 'minimal'}
            onClick={() => setFilter('filter_1')}
            minimalTypePadding
          >
            {t('filter_1')}
          </Button>

          <Button
            behavior="button"
            type={filter === 'filter_2' ? 'primary' : 'minimal'}
            onClick={() => setFilter('filter_2')}
            minimalTypePadding
          >
            {t('filter_2')}
          </Button>
        </div>
      }
    >
      <div className="pl-6 pr-4">
        <DataTable
          resource="payment"
          columns={columns}
          className="pr-4"
          endpoint="/api/v1/payments?include=client,invoices&sort=date|desc&per_page=50&filter_deleted_clients=true&page=1"
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
          style={{
            height: '19.9rem',
          }}
        />
      </div>
    </Card>
  );
}
