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

export function Tasks() {
  const [t] = useTranslation();

  useTitle('tasks');

  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages: BreadcrumRecord[] = [{ name: t('tasks'), href: '/tasks' }];

  const columns: DataTableColumns = [
    {
      id: 'status',
      label: t('status'),
    },
    { id: 'number', label: t('number') },
    { id: 'client', label: t('client') },
    {
      id: 'project',
      label: t('project'),
    },
    {
      id: 'duration',
      label: t('duration'),
    },
    {
      id: 'entity state',
      label: t('entity state'),
      format: (value) => date(value, dateFormat),
    },
  ];

  return (
    <Default breadcrumbs={pages} title={t('tasks')}>
      <DataTable
        resource="invoice"
        endpoint="api/v1/tasks"
        columns={columns}
        linkToCreate="/tasks/create"
        linkToEdit="/tasks/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
