/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from 'common/hooks/useTitle';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';

export function Credits() {
  const [t] = useTranslation();

  useTitle('projects');

  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages: BreadcrumRecord[] = [{ name: t('credits'), href: '/credits' }];

  const columns: DataTableColumns = [
    {
      id: 'status',
      label: t('status'),
    },
    { id: 'number', label: t('number') },
    { id: 'client', label: t('client') },
    {
      id: 'amount',
      label: t('amount'),
    },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'remaining',
      label: t('remaining'),
    },
  ];

  return (
    <Default breadcrumbs={pages} title={t('credits')}>
      <DataTable
        resource="credit"
        endpoint="api/v1/credits"
        columns={columns}
        linkToCreate="/credits/create"
        linkToEdit="/credits/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
