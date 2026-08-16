/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { useEnabled } from '$app/common/guards/guards/enabled';
import { permission } from '$app/common/guards/guards/permission';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useTitle } from '$app/common/hooks/useTitle';
import { Expense } from '$app/common/interfaces/expense';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Invoice } from '$app/common/interfaces/invoice';
import { Project } from '$app/common/interfaces/project';
import { Quote } from '$app/common/interfaces/quote';
import { Task } from '$app/common/interfaces/task';
import { Page } from '$app/components/Breadcrumbs';
import { DataTable } from '$app/components/DataTable';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { EntityStatus } from '$app/components/EntityStatus';
import { InputLabel, Link } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { InfoCard } from '$app/components/InfoCard';
import { Default } from '$app/components/layouts/Default';
import { PreviousNextNavigation } from '$app/components/PreviousNextNavigation';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { TagPills } from '$app/components/tags/TagPills';
import { ClientActionButtons } from '$app/pages/invoices/common/components/ClientActionButtons';
import { ProjectAnalytics } from '$app/pages/projects/analytics/ProjectAnalytics';
import { ModuleBitmask } from '$app/pages/settings';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import {
  defaultColumns,
  useAllTaskColumns,
  useCustomBulkActions,
  useTaskColumns,
  useTaskFilters,
  useActions as useTasksActions,
} from '$app/pages/tasks/common/hooks';
import { useFilterColumns } from '$app/pages/tasks/common/hooks/useFilterColumns';
import { useShowEditOption } from '$app/pages/tasks/common/hooks/useShowEditOption';
import { useActions as useProjectsActions } from '../common/hooks';
import { ProjectPrivateNotes } from './components/ProjectPrivateNotes';
import { ProjectPublicNotes } from './components/ProjectPublicNotes';

dayjs.extend(duration);

export default function Show() {
  const { documentTitle } = useTitle('project');
  const { t } = useTranslation();
  const { id } = useParams();

  const navigate = useNavigate();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const enabled = useEnabled();

  const pages: Page[] = [
    { name: t('projects'), href: '/projects' },
    { name: t('project'), href: route('/projects/:id', { id }) },
  ];

  const { data: project } = useQuery({
    queryKey: ['/api/v1/projects', `/api/v1/projects/${id}`],
    queryFn: () =>
      request(
        'GET',
        endpoint(
          `/api/v1/projects/${id}?include=client,tasks,invoices,quotes,expenses`
        )
      ).then(
        (response: GenericSingleResourceResponse<Project>) => response.data.data
      ),
    staleTime: Infinity,
  });

  const projectActions = useProjectsActions();
  const taskActions = useTasksActions();
  const columns = useTaskColumns();

  const filters = useTaskFilters();
  const taskColumns = useAllTaskColumns();
  const filterColumns = useFilterColumns();

  const customBulkActions = useCustomBulkActions();

  const showEditOption = useShowEditOption();
  const colors = useColorScheme();

  const [includeDrafts, setIncludeDrafts] = useState(false);
  const [canViewFinancials, setCanViewFinancials] = useState(false);

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  if (!project) {
    return (
      <Default title={documentTitle} breadcrumbs={pages}>
        <Spinner />
      </Default>
    );
  }

  const showTasks = enabled(ModuleBitmask.Tasks);
  const tasksContent = (
    <DataTable
      resource="task"
      columns={columns}
      customActions={taskActions}
      endpoint={`/api/v1/tasks?include=status,client,project,user,assigned_user,tags&sort=id|desc&project_tasks=${project.id}&without_deleted_clients=true`}
      bulkRoute="/api/v1/tasks/bulk"
      linkToCreate={`/tasks/create?project=${id}&rate=${project.task_rate}`}
      linkToEdit="/tasks/:id/edit"
      showEdit={(task: Task) => showEditOption(task)}
      customFilters={filters}
      customBulkActions={customBulkActions}
      customFilterPlaceholder="status"
      filterColumns={filterColumns}
      withResourcefulActions
      rightSide={
        <DataTableColumnsPicker
          columns={taskColumns as unknown as string[]}
          defaultColumns={defaultColumns}
          table="task"
        />
      }
      linkToCreateGuards={[permission('create_task')]}
      hideEditableOptions={!hasPermission('edit_task')}
    />
  );

  const overviewContent = (forecastCard: ReactNode) => (
    <div className="grid grid-cols-12 gap-4 lg:space-y-0">
      <InfoCard
        title={project.name}
        className="col-span-12 h-full p-4 shadow-sm lg:col-span-6 xl:col-span-4 2xl:h-max 2xl:col-span-3"
        style={{ borderColor: colors.$24 }}
        withoutPadding
      >
        <div className="flex flex-col space-y-3 pt-1">
          <div className="flex space-x-10">
            <span className="text-sm font-medium" style={{ color: colors.$3 }}>
              {t('status')}
            </span>

            <EntityStatus entity={project} />
          </div>

          {Boolean(project.tags?.length) && (
            <div className="flex flex-col space-y-1">
              <span
                className="text-sm font-medium"
                style={{ color: colors.$3 }}
              >
                {t('tags')}
              </span>

              <div>
                <TagPills tags={project.tags} />
              </div>
            </div>
          )}

          {project.client && (
            <ClientActionButtons displayClientName client={project.client} />
          )}

          {canViewFinancials && (
            <div className="flex flex-col items-start gap-1">
              {project.invoices?.map((invoice: Invoice, index: number) => (
                <Link
                  key={index}
                  to={route('/invoices/:id/edit', { id: invoice.id })}
                >
                  {t('invoice')} #{invoice.number}
                </Link>
              ))}

              {project.quotes?.map((quote: Quote, index: number) => (
                <Link
                  key={index}
                  to={route('/quotes/:id/edit', { id: quote.id })}
                >
                  {t('quote')} #{quote.number}
                </Link>
              ))}

              {project.expenses?.map((expense: Expense, index: number) => (
                <Link
                  key={index}
                  to={route('/expenses/:id/edit', { id: expense.id })}
                >
                  {t('expense')} #{expense.number}
                </Link>
              ))}
            </div>
          )}
        </div>
      </InfoCard>

      <ProjectPrivateNotes project={project} />

      <ProjectPublicNotes project={project} />

      {forecastCard}
    </div>
  );

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      {...((hasPermission('edit_project') || entityAssigned(project)) &&
        project && {
          navigationTopRight: (
            <ResourceActions
              resource={project}
              actions={projectActions}
              saveButtonLabel={t('edit')}
              onSaveClick={() => navigate(route('/projects/:id/edit', { id }))}
              cypressRef="projectActionDropdown"
            />
          ),
        })}
      afterBreadcrumbs={<PreviousNextNavigation entity="project" />}
      topRight={
        canViewFinancials ? (
          <div className="flex flex-shrink-0 items-center justify-end space-x-3 lg:pl-6">
            <span className="whitespace-nowrap text-sm">
              {t('include_drafts')}
            </span>

            <Toggle checked={includeDrafts} onValueChange={setIncludeDrafts} />
          </div>
        ) : undefined
      }
    >
      <ProjectAnalytics
        project={project}
        includeDrafts={includeDrafts}
        overviewContent={overviewContent}
        tasksContent={showTasks ? tasksContent : undefined}
        onCanViewFinancialsChange={setCanViewFinancials}
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
        bulkUrl="/api/v1/projects/bulk"
      />
    </Default>
  );
}
