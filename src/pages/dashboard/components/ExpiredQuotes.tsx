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
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Card } from '@invoiceninja/cards';
import { Quote } from 'common/interfaces/quote';

export function ExpiredQuotes() {
  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const columns: DataTableColumns<Quote> = [
    {
      id: 'number',
      label: t('number'),
      format: (value, quote) => {
        return (
          <Link to={route('/invoices/:id/edit', { id: quote.id })}>
            {quote.number}
          </Link>
        );
      },
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (value, quote) => (
        <Link to={route('/clients/:id', { id: quote.client_id })}>
          {quote.client?.display_name}
        </Link>
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
      format: (value, quote) =>
        formatMoney(
          value,
          quote.client?.country_id || company.settings.country_id,
          quote.client?.settings.currency_id || company.settings.currency_id
        ),
    },
  ];

  return (
    <Card
      title={t('expired_quotes')}
      className="h-96"
      padding="small"
      withScrollableBody
      withoutBodyPadding
    >
      <DataTable
        resource="quote"
        columns={columns}
        endpoint="/api/v1/quotes?include=client&expired=true&without_deleted_clients=true&per_page=50&page=1"
        withoutActions
        withoutPagination
        withoutPadding
      />
    </Card>
  );
}
