/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date } from 'common/helpers';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { t } from 'i18next';
import { route } from 'common/helpers/route';
import { Link } from 'components/forms/Link';
import { Payment } from 'common/interfaces/payment';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Card } from '@invoiceninja/cards';
import { generatePath } from 'react-router-dom';
import { useHasPermission } from 'common/hooks/permissions/useHasPermission';

export function RecentPayments() {
  const { dateFormat } = useCurrentCompanyDateFormats();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();
  const hasPermission = useHasPermission();

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
      id: 'amount',
      label: t('amount'),
      format: (value, payment) =>
        formatMoney(
          value,
          payment.client?.country_id || company.settings.country_id,
          payment.client?.settings.currency_id || company.settings.currency_id
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
      format: (value) => date(value, dateFormat),
    },
  ];

  return (
    <Card
      title={t('recent_payments')}
      className="h-96"
      padding="small"
      withoutBodyPadding
      withScrollableBody
    >
      <DataTable
        resource="payment"
        columns={columns}
        endpoint="/api/v1/payments?include=client,invoices&sort=date|desc&per_page=50&page=1"
        withoutActions
        withoutPagination
        withoutPadding
        queryEnabled={hasPermission('view_payment')}
      />
    </Card>
  );
}
