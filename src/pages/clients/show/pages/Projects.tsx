/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '$app/components/forms';
import { date } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Project } from '$app/common/interfaces/project';
import { DataTable, DataTableColumns } from '$app/components/DataTable';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { dataTableStaleTime } from './Invoices';

export function Projects() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const columns: DataTableColumns<Project> = [
    {
      id: 'name',
      label: t('name'),
      format: (value, project) => (
        <Link to={route('/projects/:id', { id: project.id })}>{value}</Link>
      ),
    },
    {
      id: 'task_rate',
      label: t('task_rate'),
    },
    {
      id: 'due_date',
      label: t('due_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'public_notes',
      label: t('public_notes'),
    },
    {
      id: 'private_notes',
      label: t('private_notes'),
    },
    {
      id: 'budgeted_hours',
      label: t('budgeted_hours'),
    },
  ];

  return (
    <DataTable
      resource="project"
      endpoint={`/api/v1/projects?client_id=${id}`}
      columns={columns}
      withResourcefulActions
      bulkRoute="/api/v1/projects/bulk"
      linkToCreate={route('/projects/create?client=:id', { id: id })}
      staleTime={dataTableStaleTime}
    />
  );
}
