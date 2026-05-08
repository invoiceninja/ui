/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useMemo } from 'react';
import { useTitle } from '$app/common/hooks/useTitle';
import { route } from '$app/common/helpers/route';
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
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { Project } from '$app/common/interfaces/project';
import { InputLabel } from '$app/components/forms';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

export default function Projects() {
  useTitle('projects');

  const [t] = useTranslation();
  const hasPermission = useHasPermission();

  const pages = [{ name: t('projects'), href: '/projects' }];

  const actions = useActions();
  const columns = useProjectColumns();
  const reactSettings = useReactSettings();
  const projectColumns = useAllProjectColumns();
  const customBulkActions = useCustomBulkActions();

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  const queryInclusionEntities = useMemo(() => {
    const selectedColumns =
      reactSettings?.react_table_columns?.project || defaultColumns;

    let value = 'client';

    if (selectedColumns.includes('user')) {
      value += ',user';
    }

    if (selectedColumns.includes('assigned_to')) {
      value += ',assigned_user';
    }

    return value;
  }, [reactSettings?.react_table_columns?.project]);

  return (
    <Default title={t('projects')} breadcrumbs={pages} docsLink="en/projects/">
      <DataTable
        resource="project"
        endpoint={route(
          '/api/v1/projects?status=active&include=:include&without_deleted_clients=true&sort=id|desc',
          { include: queryInclusionEntities }
        )}
        bulkRoute="/api/v1/projects/bulk"
        columns={columns}
        customActions={actions}
        customBulkActions={customBulkActions}
        linkToCreate="/projects/create"
        linkToEdit="/projects/:id/edit"
        withResourcefulActions
        rightSide={
          <DataTableColumnsPicker
            columns={projectColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="project"
          />
        }
        linkToCreateGuards={[permission('create_project')]}
        hideEditableOptions={!hasPermission('edit_project')}
        enableSavingFilterPreference
        dateRangeColumns={[
          {
            column: 'due_date',
            queryParameterKey: 'date_range',
            includeColumnNameInQuery: true,
          },
          { column: 'created_at', queryParameterKey: 'created_between' },
        ]}
        enableSavingLatestDataForNavigation
      />

      <ChangeTemplateModal<Project>
        entity="project"
        entities={changeTemplateResources as Project[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(project) => (
          <div className="flex flex-col space-y-1">
            <InputLabel>{t('number')}</InputLabel>

            <span>{project.number}</span>
          </div>
        )}
        bulkLabelFn={(project) => (
          <div className="flex space-x-2">
            <InputLabel>{t('number')}:</InputLabel>

            <span>{project.number}</span>
          </div>
        )}
        bulkUrl="/api/v1/projects/bulk"
      />
    </Default>
  );
}
