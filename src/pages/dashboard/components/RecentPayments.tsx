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
import { Link } from '$app/components/forms/Link';
import { Payment } from '$app/common/interfaces/payment';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Card } from '$app/components/cards';
import { generatePath } from 'react-router-dom';
import dayjs from 'dayjs';
import { Badge } from '$app/components/Badge';

export function RecentPayments() {
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();

  const columns: DataTableColumns<Payment> = [
    {
      id: 'number',
      label: t('number'),
      format: (value, payment) => {
        return (
          <Link to={route('/payments/:id/edit', { id: payment.id })}>
            {payment.number}
          </Link>
        );
      },
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (value, payment) => (
        <Link to={route('/clients/:id', { id: payment.client_id })}>
          {payment.client?.display_name}
        </Link>
      ),
    },
    {
      id: 'invoice_number',
      label: t('invoice'),
      format: (value, payment) =>
        payment.invoices &&
        payment.invoices[0] && (
          <Link
            to={generatePath('/invoices/:id/edit', {
              id: payment.invoices[0].id,
            })}
          >
            {payment.invoices[0].number}
          </Link>
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
      format: (value, payment) => (
        <Badge variant="green">
          {formatMoney(
            value,
            payment.client?.country_id || company.settings.country_id,
            payment.client?.settings.currency_id || company.settings.currency_id
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
      withoutHeaderBorder
    >
      <div className="pl-6 pr-4">
        <DataTable
          resource="payment"
          columns={columns}
          className="pr-4"
          endpoint="/api/v1/payments?include=client,invoices&sort=date|desc&per_page=50&page=1"
          withoutActions
          withoutPagination
          staleTime={Infinity}
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
