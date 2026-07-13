/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useMemo, useState } from 'react';
import { useTitle } from '$app/common/hooks/useTitle';
import { route } from '$app/common/helpers/route';
import {
  DataTable,
  dateRangeAtom,
  filterColumnsValuesAtom,
} from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  useActions,
  useAllProjectColumns,
  useCustomBulkActions,
  useProjectColumns,
  useProjectFilterColumns,
} from '../common/hooks';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { permission } from '$app/common/guards/guards/permission';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { Project } from '$app/common/interfaces/project';
import { Button, InputLabel } from '$app/components/forms';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useAtom } from 'jotai';
import { emitter } from '$app';
import {
  ProjectSlider,
  projectSliderAtom,
  projectSliderVisibilityAtom,
} from '../common/components/ProjectSlider';
import { useProjectQuery } from '$app/common/queries/projects';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';

export default function Projects() {
  useTitle('projects');

  const [t] = useTranslation();
  const hasPermission = useHasPermission();

  const pages = [{ name: t('projects'), href: '/projects' }];

  const actions = useActions();
  const reactSettings = useReactSettings();
  const disableNavigation = useDisableNavigation();
  const selectedColumns =
    reactSettings?.react_table_columns?.project || defaultColumns;
  const shouldShowTagFilter = selectedColumns.includes('tags');
  const columns = useProjectColumns();
  const filterColumns = useProjectFilterColumns({
    enabled: shouldShowTagFilter,
  });
  const projectColumns = useAllProjectColumns();
  const customBulkActions = useCustomBulkActions();

  const [dateRangeEntries, setDateRangeEntries] = useAtom(dateRangeAtom);
  const [filterColumnsValues, setFilterColumnsValues] = useAtom(
    filterColumnsValuesAtom
  );

  const [sliderProjectId, setSliderProjectId] = useState<string>('');
  const [projectSlider, setProjectSlider] = useAtom(projectSliderAtom);
  const [projectSliderVisibility, setProjectSliderVisibility] = useAtom(
    projectSliderVisibilityAtom
  );

  const { data: projectResponse } = useProjectQuery({ id: sliderProjectId });

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  useEffect(() => {
    setProjectSlider(null);
  }, [sliderProjectId]);

  useEffect(() => {
    if (projectResponse && projectSliderVisibility) {
      setProjectSlider(projectResponse);
    }
  }, [projectResponse, projectSliderVisibility]);

  useEffect(() => {
    return () => setProjectSliderVisibility(false);
  }, []);

  useEffect(() => {
    if (!shouldShowTagFilter && filterColumnsValues.project_tag_ids?.length) {
      setFilterColumnsValues((current) => {
        const { project_tag_ids, ...rest } = current;

        return rest;
      });
    }
  }, [
    shouldShowTagFilter,
    filterColumnsValues.project_tag_ids,
    setFilterColumnsValues,
  ]);

  const currentFilterColumnsCount = useMemo(
    () =>
      filterColumns.filter(
        (column) => (filterColumnsValues[column.column_id] || []).length > 0
      ).length,
    [filterColumns, filterColumnsValues]
  );

  const currentDateRangeColumnsCount = useMemo(
    () =>
      dateRangeEntries.filter(
        (entry) => entry.startDate.length > 0 && entry.endDate.length > 0
      ).length,
    [dateRangeEntries]
  );

  const queryInclusionEntities = useMemo(() => {
    let value = 'client';

    if (selectedColumns.includes('user')) {
      value += ',user';
    }

    if (selectedColumns.includes('assigned_to')) {
      value += ',assigned_user';
    }

    if (selectedColumns.includes('tags')) {
      value += ',tags';
    }

    return value;
  }, [selectedColumns]);

  return (
    <Default title={t('projects')} breadcrumbs={pages} docsLink="en/projects/">
      <DataTable
        resource="project"
        endpoint={route(
          shouldShowTagFilter
            ? '/api/v1/projects?status=active&include=:include&without_deleted_clients=true&sort=id|desc'
            : '/api/v1/projects?status=active&include=:include&without_deleted_clients=true&sort=id|desc&tag_ids=',
          { include: queryInclusionEntities }
        )}
        bulkRoute="/api/v1/projects/bulk"
        columns={columns}
        customActions={actions}
        customBulkActions={customBulkActions}
        filterColumns={shouldShowTagFilter ? filterColumns : undefined}
        linkToCreate="/projects/create"
        linkToEdit="/projects/:id/edit"
        withResourcefulActions
        rightSide={
          <div className="flex items-center space-x-2">
            {(currentFilterColumnsCount > 0 ||
              currentDateRangeColumnsCount > 0) && (
              <Button
                type="secondary"
                behavior="button"
                onClick={() => {
                  setFilterColumnsValues({});
                  setDateRangeEntries([]);
                  emitter.emit('date_range_picker.clear');
                }}
              >
                {t('clear_filters')} (
                {currentFilterColumnsCount + currentDateRangeColumnsCount})
              </Button>
            )}

            <DataTableColumnsPicker
              columns={projectColumns as unknown as string[]}
              defaultColumns={defaultColumns}
              table="project"
            />
          </div>
        }
        linkToCreateGuards={[permission('create_project')]}
        hideEditableOptions={!hasPermission('edit_project')}
        onTableRowClick={(project) => {
          setSliderProjectId(project.id);
          setProjectSliderVisibility(true);
        }}
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

      {!disableNavigation('project', projectSlider) && <ProjectSlider />}

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
