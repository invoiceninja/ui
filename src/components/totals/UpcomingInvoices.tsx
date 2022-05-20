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

export function UpcomingInvoices() {
  const { dateFormat } = useCurrentCompanyDateFormats();
  const formatMoney = useFormatMoney();

  const columns: DataTableColumns = [
    {
      id: 'number',
      label: t('number'),
      format: (value, resource) => {
        return (
          <Link to={generatePath('/invoices/:id/edit', { id: resource.id })}>
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
      id: 'due_date',
      label: t('due_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'balance',
      label: t('balance'),
      format: (value, resource) =>
        formatMoney(
          value,
          resource?.client.country_id,
          resource?.client.settings.currency_id
        ),
    },
  ];

  return (
    <div className="bg-white rounded shadow">
      <div className="px-4 py-6 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {t('upcoming_invoices')}
        </h3>
      </div>

      <div className="-mt-2">
        <DataTable
          resource="invoice"
          columns={columns}
          endpoint="/api/v1/invoices?include=client&upcoming=true&per_page=50&page=1"
          withoutActions
          withoutPagination
        />
      </div>
    </div>
  );
}
