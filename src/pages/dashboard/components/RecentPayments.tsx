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
import { generatePath } from 'react-router-dom';
import { Link } from 'components/forms/Link';

export function RecentPayments() {
  const { dateFormat } = useCurrentCompanyDateFormats();
  const formatMoney = useFormatMoney();

  const columns: DataTableColumns = [
    {
      id: 'number',
      label: t('number'),
      format: (value, resource) => {
        return (
          <Link to={generatePath('/payments/:id/edit', { id: resource.id })}>
            {resource.number}
          </Link>
        );
      },
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (value, resource) => (
        <Link to={generatePath('/clients/:id', { id: resource.client.id })}>
          {resource.client.display_name}
        </Link>
      ),
    },
    {
      id: 'amount',
      label: t('amount'),
      format: (value, resource) =>
        formatMoney(
          value,
          resource?.client.country_id,
          resource?.client.settings.currency_id
        ),
    },
    {
      id: 'invoice_number',
      label: t('invoice_number'),
      format: (value, resource) => resource.invoices[0]?.number,
    },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
  ];

  return (
    <div className="bg-white rounded shadow">
      <div className="px-4 py-6 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {t('recent_payments')}
        </h3>
      </div>

      <div className="-mt-2">
        <DataTable
          resource="payment"
          columns={columns}
          endpoint="/api/v1/payments?include=client,invoices&sort=date|desc&per_page=50&page=1"
          withoutActions
          withoutPagination
        />
      </div>
    </div>
  );
}
