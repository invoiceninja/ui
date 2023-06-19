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
import { Button, Link } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { calculateTime } from '$app/pages/tasks/common/helpers/calculate-time';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import duration from 'dayjs/plugin/duration';
import dayjs from 'dayjs';
import { Inline } from '$app/components/Inline';
import { ResourceActions } from '$app/components/ResourceActions';
import { useActions } from '../common/hooks';
import { DataTable } from '$app/components/DataTable';
import {
  defaultColumns,
  useAllTaskColumns,
  useTaskColumns,
  useTaskFilters,
} from '$app/pages/tasks/common/hooks';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { permission } from '$app/common/guards/guards/permission';

dayjs.extend(duration);

export default function Show() {
  const { documentTitle } = useTitle('project');
  const { t } = useTranslation();
  const { id } = useParams();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages: Page[] = [
    { name: t('projects'), href: '/projects' },
    { name: t('project'), href: route('/projects/:id', { id }) },
  ];

  const { data: project } = useQuery({
    queryKey: ['/api/v1/projects', `/api/v1/projects/${id}`],
    queryFn: () =>
      request(
        'GET',
        endpoint(`/api/v1/projects/${id}?include=client,tasks`)
      ).then(
        (response: GenericSingleResourceResponse<Project>) => response.data.data
      ),
    staleTime: Infinity,
  });

  const actions = useActions();
  const columns = useTaskColumns();
  const formatMoney = useFormatMoney();

  const filters = useTaskFilters();
  const taskColumns = useAllTaskColumns();

  if (!project) {
    return (
      <Default title={documentTitle} breadcrumbs={pages}>
        <Spinner />
      </Default>
    );
  }

  const duration = () => {
    let duration = 0;

    project.tasks?.map((task) => {
      duration += parseInt(calculateTime(task.time_log, { inSeconds: true }));
    });

    return dayjs.duration(duration, 'seconds').format('HH:mm:ss');
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={
        <Inline>
          <Button to={`/projects/${id}/edit`}>{t('edit_project')}</Button>

          <ResourceActions
            resource={project}
            label={t('more_actions')}
            actions={actions}
          />
        </Inline>
      }
    >
      <div className="grid grid-cols-3 gap-4">
        <InfoCard title={t('details')}>
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
              project.client!.country_id,
              project.client!.settings.currency_id
            )}
          </p>
        </InfoCard>

        <InfoCard title={t('notes')}>
          <p>{project.public_notes}</p>
        </InfoCard>

        <InfoCard title={t('summary')}>
          <p>
            {t('tasks')}: {project.tasks?.length}
          </p>

          <p>
            {t('duration')}: {duration()}
          </p>
        </InfoCard>
      </div>

      <div className="my-4">
        <DataTable
          resource="task"
          columns={columns}
          customActions={actions}
          endpoint={`/api/v1/tasks?include=status,client,project&sort=id|desc&project_tasks=${project.id}`}
          bulkRoute="/api/v1/tasks/bulk"
          linkToCreate="/tasks/create"
          customFilters={filters}
          customFilterQueryKey="client_status"
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
        />
      </div>
    </Default>
  );
}
