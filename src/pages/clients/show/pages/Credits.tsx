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
import creditStatus from 'common/constants/credit-status';
import { date } from 'common/helpers';
import { route } from 'common/helpers/route';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { Credit } from 'common/interfaces/credit';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function Credits() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const columns: DataTableColumns<Credit> = [
    {
      id: 'number',
      label: t('number'),
      format: (value, credit) => (
        <Link to={route('/credits/:id/edit', { id: credit.id })}>
          {value}
        </Link>
      ),
    },
    {
      id: 'status_id',
      label: t('status'),
      format: (value) => <StatusBadge for={creditStatus} code={value} />,
    },
    {
      id: 'amount',
      label: t('amount'),
      format: (value) => value.toString().toUpperCase(),
    },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'amount',
      label: t('remaining'),
    },
  ];

  return (
    <DataTable
      resource="credit"
      endpoint={`/api/v1/credits?client_id=${id}`}
      columns={columns}
      withResourcefulActions
      bulkRoute="/api/v1/credits/bulk"
      linkToCreate={route('/credits/create?client=:id', { id: id })}
    />
  );
}
