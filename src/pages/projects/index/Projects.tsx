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
  useActions,
  useAllProjectColumns,
  useCustomBulkActions,
  useProjectColumns,
} from '../common/hooks';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { permission } from '$app/common/guards/guards/permission';

export default function Projects() {
  useTitle('projects');

  const [t] = useTranslation();

  const pages = [{ name: t('projects'), href: '/projects' }];

  const columns = useProjectColumns();

  const actions = useActions();

  const projectColumns = useAllProjectColumns();

  const customBulkActions = useCustomBulkActions();

  return (
    <Default
      title={t('projects')}
      breadcrumbs={pages}
      docsLink="en/projects/"
      withoutBackButton
    >
      <DataTable
        resource="project"
        endpoint="/api/v1/projects?status=active&include=client&without_deleted_clients=true&sort=id|desc"
        bulkRoute="/api/v1/projects/bulk"
        columns={columns}
        customActions={actions}
        customBulkActions={customBulkActions}
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
        linkToCreateGuards={[permission('create_project')]}
      />
    </Default>
  );
}
