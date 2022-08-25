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
import { Project } from 'common/interfaces/project';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { EntityStatus } from 'components/EntityStatus';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

export function Projects() {
  useTitle('projects');

  const [t] = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages = [{ name: t('projects'), href: '/projects' }];

  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();

  const columns: DataTableColumns<Project> = [
    {
      id: 'name',
      label: t('name'),
      format: (value, project) => (
        <Link to={generatePath('/projects/:id/edit', { id: project.id })}>
          {value}
        </Link>
      ),
    },
    {
      id: 'task_rate',
      label: t('task_rate'),
      format: (value) =>
        formatMoney(
          value,
          company?.settings.country_id,
          company?.settings.currency_id
        ),
    },
    {
      id: 'due_date',
      label: t('due_date'),
      format: (value) => date(value, dateFormat),
    },

    {
      id: 'public_notes',
      label: t('public_notes'),
      format: (value) => <span className="truncate">{value}</span>,
    },
    {
      id: 'private_notes',
      label: t('private_notes'),
      format: (value) => <span className="truncate">{value}</span>,
    },
    {
      id: 'budgeted_hours',
      label: t('budgeted_hours'),
      format: (value) =>
        formatMoney(
          value,
          company?.settings.country_id,
          company?.settings.currency_id
        ),
    },
    {
      id: 'entity_state',
      label: t('entity_state'),
      format: (value, resource) => <EntityStatus entity={resource} />,
    },
  ];

  const actions = [
    (project: Project) => (
      <DropdownElement
        to={generatePath('/projects/:id/clone', { id: project.id })}
      >
        {t('clone')}
      </DropdownElement>
    ),
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
        customActions={actions}
        linkToCreate="/projects/create"
        linkToEdit="/projects/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
