/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { Project } from 'common/interfaces/project';
import { DataTable } from 'components/DataTable';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { route } from 'common/helpers/route';
import {
  defaultColumns,
  projectColumns,
  useProjectColumns,
} from '../common/hooks';
import { DataTableColumnsPicker } from 'components/DataTableColumnsPicker';
import { Icon } from 'components/icons/Icon';
import { MdControlPointDuplicate } from 'react-icons/md';

export function Projects() {
  useTitle('projects');

  const [t] = useTranslation();

  const pages = [{ name: t('projects'), href: '/projects' }];
  const columns = useProjectColumns();

  const actions = [
    (project: Project) => (
      <DropdownElement
        to={route('/projects/:id/clone', { id: project.id })}
        icon={<Icon element={MdControlPointDuplicate} />}
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
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={projectColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="project"
          />
        }
      />
    </Default>
  );
}
