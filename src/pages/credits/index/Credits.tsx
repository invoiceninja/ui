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
import { Credit } from 'common/interfaces/credit';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { CreditStatus } from '../common/components/CreditStatus';
import { useActions } from '../common/hooks';

export function Credits() {
  useTitle('credits');

  const [t] = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();

  const pages = [{ name: t('credits'), href: '/credits' }];

  const company = useCurrentCompany();

  const columns: DataTableColumns<Credit> = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value, credit) => <CreditStatus entity={credit} />,
    },
    {
      id: 'number',
      label: t('number'),
      format: (field, credit) => (
        <Link to={generatePath('/credits/:id/edit', { id: credit.id })}>
          {field}
        </Link>
      ),
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (_, credit) => (
        <Link to={generatePath('/clients/:id', { id: credit.client_id })}>
          {credit.client?.display_name}
        </Link>
      ),
    },
    {
      id: 'amount',
      label: t('amount'),
      format: (value, credit) =>
        formatMoney(
          value,
          credit.client?.country_id || company.settings.country_id,
          credit.client?.settings.currency_id || company.settings.currency_id
        ),
    },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'balance',
      label: t('remaining'),
      format: (_, credit) => {
        return formatMoney(
          credit.balance,
          credit.client?.country_id || company.settings.country_id,
          credit.client?.settings.currency_id || company.settings.currency_id
        );
      },
    },
  ];

  const actions = useActions();

  return (
    <Default title={t('credits')} breadcrumbs={pages} docsLink="docs/credits/">
      <DataTable
        resource="credit"
        endpoint="/api/v1/credits?include=client"
        bulkRoute="/api/v1/credits/bulk"
        columns={columns}
        linkToCreate="/credits/create"
        linkToEdit="/credits/:id/edit"
        customActions={actions}
        withResourcefulActions
      />
    </Default>
  );
}
