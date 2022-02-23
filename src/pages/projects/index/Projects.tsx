/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { EntityStatus } from 'components/EntityStatus';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';

export function Projects() {
  const [t] = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages = [{ name: t('projects'), href: '/projects' }];
  const columns: DataTableColumns = [
    {
      id: 'name',
      label: t('name'),
    },

    { id: 'client_id', label: t('client') },
    {
      id: 'task_rate',
      label: t('task_rate'),
    }, //due date format
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
      id: 'bugeted_hours',
      label: t('bugeted_hours'),
    },
    {
      id: 'entity_state',
      label: t('entity_state'),
      format: (value, resource) => <EntityStatus entity={resource} />,
    },
  ];
  return (
    <Default
      title={t('projects')}
      breadcrumbs={pages}
      docsLink="docs/projects/"
    >
      <DataTable
        resource="project"
        endpoint="/api/v1/projects"
        columns={columns}
        linkToCreate="/projects/create"
        linkToEdit="/projects/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
