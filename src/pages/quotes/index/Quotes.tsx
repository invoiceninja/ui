/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { date } from 'common/helpers';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from 'common/hooks/useTitle';
import { Quote } from 'common/interfaces/quote';
import { Page } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { QuoteStatus } from '../common/components/QuoteStatus';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Download } from 'react-feather';
import { useActions } from '../common/hooks';

export function Quotes() {
  const { documentTitle } = useTitle('quotes');
  const { dateFormat } = useCurrentCompanyDateFormats();

  const [t] = useTranslation();

  const pages: Page[] = [{ name: t('quotes'), href: generatePath('/quotes') }];

  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();

  const importButton = (
    <ReactRouterLink to="/quotes/import">
      <button className="inline-flex items-center justify-center py-2 px-4 rounded text-sm text-white bg-green-500 hover:bg-green-600">
        <svg
          className="w-4 h-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="3 3 20 20"
        >
          <Download />
        </svg>
        <span>{t('import')}</span>
      </button>
    </ReactRouterLink>
  );

  const columns: DataTableColumns<Quote> = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value, quote) => <QuoteStatus entity={quote} />,
    },
    {
      id: 'number',
      label: t('number'),
      format: (field, quote) => (
        <Link to={generatePath('/quotes/:id/edit', { id: quote.id })}>
          {field}
        </Link>
      ),
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (_, quote) => (
        <Link to={generatePath('/clients/:id', { id: quote.client_id })}>
          {quote.client?.display_name}
        </Link>
      ),
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
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'valid_until',
      label: t('valid_until'),
      format: (value, quote) => date(quote.due_date, dateFormat),
    },
  ];

  const actions = useActions();

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <DataTable
        resource="quote"
        columns={columns}
        endpoint="/api/v1/quotes?include=client"
        linkToEdit="/quotes/:id/edit"
        linkToCreate="/quotes/create"
        bulkRoute="/api/v1/quotes/bulk"
        customActions={actions}
        withResourcefulActions
        rightSide={importButton}
      />
    </Default>
  );
}
