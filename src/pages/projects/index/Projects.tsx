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

export function Projects() {
  const [t] = useTranslation();

  useTitle('projects');

  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages: BreadcrumRecord[] = [{ name: t('projects'), href: '/projects' }];

  const columns: DataTableColumns = [
    {
      id: 'name',
      label: t('name'),
    },
    { id: 'client', label: t('client') },
    { id: 'task rate', label: t('task rate') },
    {
      id: 'due rate',
      label: t('due rate'),
    },
    {
      id: 'public notes',
      label: t('public notes'),
    },
    {
      id: 'private notes',
      label: t('private notes'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'budgeted Hours',
      label: t('budgeted Hours'),
    },
    {
      id: 'entity state',
      label: t('entity state'),
    },
  ];

  return (
    <Default breadcrumbs={pages} title={t('projects')}>
      <DataTable
        resource="invoice"
        endpoint="api/v1/projects"
        columns={columns}
        linkToCreate="/projects/create"
        linkToEdit="/projects/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
