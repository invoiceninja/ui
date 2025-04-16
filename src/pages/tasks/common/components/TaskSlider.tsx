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
import { Element } from '$app/components/cards';
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
import { useUserNumberPrecision } from '$app/common/hooks/useUserNumberPrecision';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import styled from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { SquareActivityChart } from '$app/components/icons/SquareActivityChart';

export const taskSliderAtom = atom<Task | null>(null);
export const taskSliderVisibilityAtom = atom(false);

dayjs.extend(relativeTime);

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

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
      task: (
        <Link
          to={route('/tasks/:id/edit', {
            id: activity.task?.hashed_id,
          })}
        >
          {activity?.task?.label}
        </Link>
      ),
      contact: (
        <Link
          to={route('/clients/:id/edit', {
            id: activity?.contact?.hashed_id,
          })}
        >
          {activity?.contact?.label}
        </Link>
      ),
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
  const colors = useColorScheme();

  const actions = useActions({
    showCommonBulkAction: true,
    showEditAction: true,
  });

  const { timeFormat } = useCompanyTimeFormat();
  const userNumberPrecision = useUserNumberPrecision();
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
        task && (hasPermission('edit_task') || entityAssigned(task)) ? (
          <ResourceActions
            label={t('actions')}
            resource={task}
            actions={actions}
          />
        ) : null
      }
      withoutActionContainer
      withoutHeaderBorder
    >
      <TabGroup
        tabs={[t('overview'), t('activity')]}
        width="full"
        withHorizontalPadding
        horizontalPaddingWidth="3.5rem"
      >
        <div className="space-y-2">
          <div className="px-6">
            <Element
              className="border-b border-dashed"
              leftSide={t('amount')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {task
                ? formatMoney(
                    task.rate *
                      calculateTaskHours(task.time_log, userNumberPrecision),
                    task.client?.country_id,
                    task.client?.settings.currency_id
                  )
                : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('entity_state')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {task ? t(calculateEntityState(task)) : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('duration')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {task ? calculateHours(task.time_log.toString(), true) : null}
            </Element>

            <Element
              leftSide={t('status')}
              pushContentToRight
              noExternalPadding
            >
              {task ? <TaskStatus entity={task} withoutDropdown /> : null}
            </Element>
          </div>

          <Divider withoutPadding borderColor={colors.$20} />

          <div className="flex flex-col space-y-4 px-6 py-5">
            {task &&
              currentTaskTimeLogs?.map(([date, start, end], i) => (
                <Box
                  key={i}
                  className="flex items-center justify-between p-4 w-full shadow-sm border rounded-md"
                  style={{ borderColor: colors.$20 }}
                  theme={{
                    backgroundColor: colors.$1,
                    hoverBackgroundColor: colors.$4,
                  }}
                >
                  <div className="flex flex-col">
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.$3 }}
                    >
                      {formatDate(date, dateFormat)}
                    </p>

                    <span className="text-xs" style={{ color: colors.$17 }}>
                      {start} - {end}
                    </span>
                  </div>

                  <div
                    className="text-sm font-medium"
                    style={{ color: colors.$3 }}
                  >
                    {isTaskRunning(task) &&
                    i === currentTaskTimeLogs.length - 1 ? (
                      <TaskClock task={task} calculateLastTimeLog={true} />
                    ) : (
                      calculateDifferenceBetweenLogs(task.time_log, i)
                    )}
                  </div>
                </Box>
              ))}
          </div>
        </div>

        <div>
          <div className="flex flex-col pt-3 px-3">
            {activities?.map((activity) => (
              <Box
                key={activity.id}
                className="flex space-x-3 p-4 rounded-md flex-1 min-w-0"
                theme={{
                  backgroundColor: colors.$1,
                  hoverBackgroundColor: colors.$25,
                }}
              >
                <div className="flex items-center justify-center">
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: colors.$20 }}
                  >
                    <SquareActivityChart
                      size="1.3rem"
                      color={colors.$16}
                      filledColor={colors.$16}
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
                  <div className="text-sm" style={{ color: colors.$3 }}>
                    {activityElement(activity)}
                  </div>

                  <div
                    className="flex w-full items-center space-x-1 text-xs truncate"
                    style={{ color: colors.$17 }}
                  >
                    <span className="whitespace-nowrap">
                      {date(activity.created_at, `${dateFormat} ${timeFormat}`)}
                    </span>

                    <span>-</span>

                    <span>{activity.ip}</span>
                  </div>
                </div>
              </Box>
            ))}
          </div>
        </div>
      </TabGroup>
    </Slider>
  );
}
