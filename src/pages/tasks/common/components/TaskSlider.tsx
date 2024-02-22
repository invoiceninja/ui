/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { TabGroup } from '$app/components/TabGroup';
import { ClickableElement, Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import { Slider } from '$app/components/cards/Slider';
import { atom, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { date, endpoint, trans } from '$app/common/helpers';
import { ResourceActions } from '$app/components/ResourceActions';
import { useQuery } from 'react-query';
import { request } from '$app/common/helpers/request';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { AxiosResponse } from 'axios';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { Link } from '$app/components/forms';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { route } from '$app/common/helpers/route';
import reactStringReplace from 'react-string-replace';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useActions } from '../hooks';
import { TaskStatus } from './TaskStatus';
import { Task } from '$app/common/interfaces/task';
import { TaskActivity } from '$app/common/interfaces/task-activity';
import {
  calculateDifferenceBetweenLogs,
  calculateHours,
} from '../helpers/calculate-time';
import {
  calculateEntityState,
  isTaskRunning,
} from '../helpers/calculate-entity-state';
import { calculateTaskHours } from '$app/pages/projects/common/hooks/useInvoiceProject';
import { date as formatDate } from '$app/common/helpers';
import { useFormatTimeLog } from '../../kanban/common/hooks';
import { TaskClock } from '../../kanban/components/TaskClock';

export const taskSliderAtom = atom<Task | null>(null);
export const taskSliderVisibilityAtom = atom(false);

dayjs.extend(relativeTime);

function useGenerateActivityElement() {
  const [t] = useTranslation();

  return (activity: TaskActivity) => {
    let text = trans(`activity_${activity.activity_type_id}`, {});

    const replacements = {
      client: (
        <Link to={route('/clients/:id', { id: activity.client?.hashed_id })}>
          {activity.client?.label}
        </Link>
      ),
      user: activity.user?.label ?? t('system'),
      task:
        (
          <Link
            to={route('/tasks/:id/edit', {
              id: activity.task?.hashed_id,
            })}
          >
            {activity?.task?.label}
          </Link>
        ) ?? '',
      contact:
        (
          <Link
            to={route('/clients/:id/edit', {
              id: activity?.contact?.hashed_id,
            })}
          >
            {activity?.contact?.label}
          </Link>
        ) ?? '',
    };
    for (const [variable, value] of Object.entries(replacements)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      text = reactStringReplace(text, `:${variable}`, () => value);
    }

    return text;
  };
}

export function TaskSlider() {
  const [t] = useTranslation();

  const actions = useActions({
    showCommonBulkAction: true,
    showEditAction: true,
  });
  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const formatTimeLog = useFormatTimeLog();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const activityElement = useGenerateActivityElement();

  const [task, setTask] = useAtom(taskSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(taskSliderVisibilityAtom);

  const currentTaskTimeLogs = task && formatTimeLog(task.time_log);

  const { data: activities } = useQuery({
    queryKey: ['/api/v1/activities', task?.id, 'task'],
    queryFn: () =>
      request('POST', endpoint('/api/v1/activities/entity'), {
        entity: 'task',
        entity_id: task?.id,
      }).then(
        (response: AxiosResponse<GenericManyResponse<TaskActivity>>) =>
          response.data.data
      ),
    enabled: task !== null && isVisible,
    staleTime: Infinity,
  });

  return (
    <Slider
      size="regular"
      visible={isVisible}
      onClose={() => {
        setIsSliderVisible(false);
        setTask(null);
      }}
      title={`${t('task')} ${task?.number}`}
      topRight={
        task &&
        (hasPermission('edit_task') || entityAssigned(task)) && (
          <ResourceActions
            label={t('more_actions')}
            resource={task}
            actions={actions}
          />
        )
      }
      withoutActionContainer
    >
      <TabGroup tabs={[t('overview'), t('activity')]} width="full">
        <div className="space-y-2">
          <div>
            <Element leftSide={t('amount')}>
              {task
                ? formatMoney(
                    task.rate * calculateTaskHours(task.time_log),
                    task.client?.country_id,
                    task.client?.settings.currency_id
                  )
                : null}
            </Element>

            <Element leftSide={t('entity_state')}>
              {task ? t(calculateEntityState(task)) : null}
            </Element>

            <Element leftSide={t('duration')}>
              {task ? calculateHours(task.time_log.toString(), true) : null}
            </Element>

            <Element leftSide={t('status')}>
              {task ? <TaskStatus entity={task} /> : null}
            </Element>
          </div>

          <Divider withoutPadding />

          {task &&
            currentTaskTimeLogs?.map(([date, start, end], i) => (
              <ClickableElement key={i}>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p>{formatDate(date, dateFormat)}</p>

                    <small>
                      {start} - {end}
                    </small>
                  </div>

                  <div>
                    {isTaskRunning(task) &&
                    i === currentTaskTimeLogs.length - 1 ? (
                      <TaskClock task={task} calculateLastTimeLog={true} />
                    ) : (
                      calculateDifferenceBetweenLogs(task.time_log, i)
                    )}
                  </div>
                </div>
              </ClickableElement>
            ))}
        </div>

        <div>
          {activities?.map((activity) => (
            <NonClickableElement key={activity.id} className="flex flex-col">
              <p>{activityElement(activity)}</p>
              <div className="inline-flex items-center space-x-1">
                <p>{date(activity.created_at, `${dateFormat} h:mm:ss A`)}</p>
                <p>&middot;</p>
                <p>{activity.ip}</p>
              </div>
            </NonClickableElement>
          ))}
        </div>
      </TabGroup>
    </Slider>
  );
}
