/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { DataTable } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  projectColumns,
  useActions,
  useProjectColumns,
} from '../common/hooks';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';

export function Projects() {
  useTitle('projects');

  const [t] = useTranslation();

  const pages = [{ name: t('projects'), href: '/projects' }];

  const columns = useProjectColumns();

  const actions = useActions();

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
