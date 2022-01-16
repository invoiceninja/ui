/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from 'common/hooks/useTitle';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

export function Clients() {
  const [t] = useTranslation();

  useTitle('clients');

  const { dateFormat } = useCurrentCompanyDateFormats();

  const columns: DataTableColumns = [
    {
      id: 'number',
      label: t('number'),
      format: (value, resource) => (
        <Link to={generatePath('/clients/:id/edit', { id: resource.id })}>
          {value}
        </Link>
      ),
    },
    { id: 'name', label: t('name') },
    { id: 'balance', label: t('balance') },
    {
      id: 'paid_to_date',
      label: t('paid_to_date'),
      format: (value) => (value === 0 ? '' : date(value, dateFormat)),
    },
    {
      id: 'last_login',
      label: t('last_login_at'),
      format: (value) => (value === 0 ? '' : date(value, dateFormat)),
    },
  ];

  return (
    <Default title={t('clients')}>
      <DataTable columns={columns} endpoint="/api/v1/clients" />
    </Default>
  );
}
