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
import { DataTable } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  useActions,
  useAllProjectColumns,
  useProjectColumns,
} from '../common/hooks';
import { DataTableColumnsPicker } from 'components/DataTableColumnsPicker';

export function Projects() {
  useTitle('projects');

  const [t] = useTranslation();

  const pages = [{ name: t('projects'), href: '/projects' }];

  const columns = useProjectColumns();

  const actions = useActions();

  const projectColumns = useAllProjectColumns();

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
