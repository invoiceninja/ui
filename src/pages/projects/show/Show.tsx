/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date, endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from '$app/common/hooks/useTitle';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Project } from '$app/common/interfaces/project';
import { Page } from '$app/components/Breadcrumbs';
import { InfoCard } from '$app/components/InfoCard';
import { Spinner } from '$app/components/Spinner';
import { Link } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import duration from 'dayjs/plugin/duration';
import dayjs from 'dayjs';
import { ResourceActions } from '$app/components/ResourceActions';
import { useActions as useProjectsActions } from '../common/hooks';
import { DataTable } from '$app/components/DataTable';
import {
  defaultColumns,
  useActions as useTasksActions,
  useAllTaskColumns,
  useTaskColumns,
  useTaskFilters,
  useCustomBulkActions,
} from '$app/pages/tasks/common/hooks';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { permission } from '$app/common/guards/guards/permission';
import { Task } from '$app/common/interfaces/task';
import { useShowEditOption } from '$app/pages/tasks/common/hooks/useShowEditOption';
import { useEnabled } from '$app/common/guards/guards/enabled';
import { ModuleBitmask } from '$app/pages/settings';
import { EntityStatus } from '$app/components/EntityStatus';
import { useColorScheme } from '$app/common/colors';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { Invoice } from '$app/common/interfaces/invoice';
import { Expense } from '$app/common/interfaces/expense';
import { Quote } from '$app/common/interfaces/quote';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';

dayjs.extend(duration);

export default function Show() {
  const { documentTitle } = useTitle('project');
  const { t } = useTranslation();
  const { id } = useParams();
  const { dateFormat } = useCurrentCompanyDateFormats();

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
              label={t('more_actions')}
              actions={projectActions}
              cypressRef="projectActionDropdown"
            />
          ),
        })}
    >
      <div className="grid grid-cols-3 gap-4">
        <InfoCard title={project.name}>
          {project && (
            <div className="flex space-x-20 my-3">
              <span
                className="text-sm"
                style={{
                  backgroundColor: colors.$2,
                  color: colors.$3,
                  colorScheme: colors.$0,
                }}
              >
                {t('status')}
              </span>
              <EntityStatus entity={project} />
            </div>
          )}

          <Link
            className="block"
            to={route('/clients/:id', { id: project.client_id })}
          >
            {project.client?.display_name}
          </Link>

          {project.due_date.length > 0 && (
            <p>
              {t('due_date')}: {date(project.due_date, dateFormat)}
            </p>
          )}

          <p>
            {t('budgeted_hours')}: {project.budgeted_hours}
          </p>

          <p>
            {t('task_rate')}:
            {formatMoney(
              project.task_rate,
              project.client?.country_id,
              project.client?.settings.currency_id
            )}
          </p>
        </InfoCard>

        <InfoCard title={t('notes')} className="h-56">
          <p>{project.public_notes}</p>

          <div className="mt-3">
            {project?.invoices?.map((invoice: Invoice, index: number) => (
              <div key={index}>
                <Link to={route('/invoices/:id/edit', { id: invoice.id })}>
                  {t('invoice')} #{invoice.number}
                </Link>
              </div>
            ))}

            {project?.quotes?.map((quote: Quote, index: number) => (
              <div key={index}>
                <Link to={route('/quotes/:id/edit', { id: quote.id })}>
                  {t('quote')} #{quote.number}
                </Link>
              </div>
            ))}

            {project?.expenses?.map((expense: Expense, index: number) => (
              <div key={index}>
                <Link to={route('/expenses/:id/edit', { id: expense.id })}>
                  {t('expense')} #{expense.number}
                </Link>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard title={t('summary')}>
          <p>
            {t('tasks')}: {project.tasks?.length}
          </p>

          <p>
            {t('total_hours')}: {project.current_hours}
          </p>
        </InfoCard>
      </div>

      {enabled(ModuleBitmask.Tasks) && (
        <div className="my-4">
          <DataTable
            resource="task"
            columns={columns}
            customActions={taskActions}
            endpoint={`/api/v1/tasks?include=status,client,project&sort=id|desc&project_tasks=${project.id}`}
            bulkRoute="/api/v1/tasks/bulk"
            linkToCreate={`/tasks/create?project=${id}&rate=${project.task_rate}`}
            linkToEdit="/tasks/:id/edit"
            showEdit={(task: Task) => showEditOption(task)}
            customFilters={filters}
            customBulkActions={customBulkActions}
            customFilterPlaceholder="status"
            withResourcefulActions
            leftSideChevrons={
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
        labelFn={(project) => `${t('number')}: ${project.number}`}
        bulkUrl="/api/v1/projects/bulk"
      />
    </Default>
  );
}
