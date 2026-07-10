/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { useEnabled } from '$app/common/guards/guards/enabled';
import { permission } from '$app/common/guards/guards/permission';
import { date, endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useFormatNumber } from '$app/common/hooks/useFormatNumber';
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
import { InfoCard } from '$app/components/InfoCard';
import { Default } from '$app/components/layouts/Default';
import { PreviousNextNavigation } from '$app/components/PreviousNextNavigation';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { ClientActionButtons } from '$app/pages/invoices/common/components/ClientActionButtons';
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
  const { dateFormat } = useCurrentCompanyDateFormats();

  const navigate = useNavigate();
  const formatNumber = useFormatNumber();
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
  const formatMoney = useFormatMoney();

  const filters = useTaskFilters();
  const taskColumns = useAllTaskColumns();
  const filterColumns = useFilterColumns();

  const customBulkActions = useCustomBulkActions();

  const showEditOption = useShowEditOption();
  const colors = useColorScheme();

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
    >
      <div className="grid grid-cols-12 lg:space-y-0 gap-4">
        <InfoCard
          title={project.name}
          className="shadow-sm h-full 2xl:h-max col-span-12 lg:col-span-6 xl:col-span-4 2xl:col-span-3 p-4"
          style={{ borderColor: colors.$24 }}
          withoutPadding
        >
          <div className="flex flex-col space-y-3 pt-1">
            {project && (
              <div className="flex space-x-10">
                <span
                  className="text-sm font-medium"
                  style={{
                    color: colors.$3,
                  }}
                >
                  {t('status')}
                </span>

                <EntityStatus entity={project} />
              </div>
            )}

            {project.client && (
              <ClientActionButtons displayClientName client={project.client} />
            )}

            <div>
              {project.due_date.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{t('due_date')}:</span>

                  <span className="text-sm">
                    {date(project.due_date, dateFormat)}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {t('budgeted_hours')}:
                </span>

                <span className="text-sm">
                  {formatNumber(project.budgeted_hours)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{t('task_rate')}:</span>

                <span className="text-sm">
                  {formatMoney(
                    project.task_rate,
                    project.client?.country_id,
                    project.client?.settings.currency_id
                  )}
                </span>
              </div>
            </div>

            <div>
              {project?.invoices?.map((invoice: Invoice, index: number) => (
                <Link
                  key={index}
                  to={route('/invoices/:id/edit', { id: invoice.id })}
                >
                  {t('invoice')} #{invoice.number}
                </Link>
              ))}

              {project?.quotes?.map((quote: Quote, index: number) => (
                <Link
                  key={index}
                  to={route('/quotes/:id/edit', { id: quote.id })}
                >
                  {t('quote')} #{quote.number}
                </Link>
              ))}

              {project?.expenses?.map((expense: Expense, index: number) => (
                <Link
                  key={index}
                  to={route('/expenses/:id/edit', { id: expense.id })}
                >
                  {t('expense')} #{expense.number}
                </Link>
              ))}
            </div>
          </div>
        </InfoCard>

        <ProjectPrivateNotes project={project} />

        <ProjectPublicNotes project={project} />

        <InfoCard
          title={t('summary')}
          className="shadow-sm h-full 2xl:h-max col-span-12 lg:col-span-6 xl:col-span-4 2xl:col-span-3 p-4"
          style={{ borderColor: colors.$24 }}
          withoutPadding
        >
          <div className="flex space-x-2">
            <span className="font-medium">{t('active_tasks')}:</span>

            <span>{project.tasks?.length}</span>
          </div>

          <div className="flex space-x-2">
            <span className="font-medium">{t('total_hours')}:</span>

            <span>{parseFloat((project?.current_hours || 0).toFixed(4))}</span>
          </div>
        </InfoCard>
      </div>

      {enabled(ModuleBitmask.Tasks) && (
        <div className="my-4">
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
        </div>
      )}

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
