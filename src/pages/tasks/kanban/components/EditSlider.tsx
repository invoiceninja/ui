/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ClickableElement } from '$app/components/cards';
import { Button, InputField } from '$app/components/forms';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Task } from '$app/common/interfaces/task';
import { TaskStatus } from '$app/common/interfaces/task-status';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import { Modal } from '$app/components/Modal';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { TabGroup } from '$app/components/TabGroup';
import { UserSelector } from '$app/components/users/UserSelector';
import { useAtom } from 'jotai';
import { LogPosition } from '$app/pages/tasks/common/components/TaskTable';
import {
  duration,
  handleTaskDateChange,
  handleTaskDurationChange,
  handleTaskTimeChange,
  parseTime,
  parseTimeToDate,
} from '$app/pages/tasks/common/helpers';
import {
  parseTimeLog,
  TimeLogsType,
} from '$app/pages/tasks/common/helpers/calculate-time';
import { useSave } from '$app/pages/tasks/common/hooks';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currentTaskAtom } from '../common/atoms';
import { useFormatTimeLog } from '../common/hooks';
import { date as formatDate } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { TaskStatusSelector } from '$app/components/task-statuses/TaskStatusSelector';

export function EditSlider() {
  const [t] = useTranslation();
  const [task, setTask] = useAtom(currentTaskAtom);

  const { dateFormat } = useCurrentCompanyDateFormats();

  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);

  const [timeLogIndex, setTimeLogIndex] = useState<number>();
  const [timeLog, setTimeLog] = useState<TimeLogsType>([]);

  const handleChange = (property: keyof Task, value: Task[typeof property]) => {
    setTask((current) => current && { ...current, [property]: value });
  };

  const company = useCurrentCompany();
  const save = useSave();
  const formatTimeLog = useFormatTimeLog();

  useEffect(() => {
    if (task?.time_log) {
      setTimeLog(parseTimeLog(task.time_log));
    }
  }, [timeLogIndex, task?.time_log]);

  const handleDateChange = (
    unix: number,
    value: string,
    index: number,
    position: number
  ) => {
    handleChange(
      'time_log',
      handleTaskDateChange(task!.time_log, unix, value, index, position)
    );
  };

  const handleTimeChange = (
    unix: number,
    time: string,
    index: number,
    position: number
  ) => {
    handleChange(
      'time_log',
      handleTaskTimeChange(task!.time_log, unix, time, position, index)
    );
  };

  const handleDurationChange = (
    value: string,
    start: number,
    index: number
  ) => {
    handleChange(
      'time_log',
      handleTaskDurationChange(task!.time_log, value, start, index)
    );
  };

  return (
    <>
      <Modal
        title={t('time_log')}
        visible={isTimeModalVisible && timeLog.length > 0}
        onClose={() => {
          setIsTimeModalVisible(false);
          setTimeLogIndex(undefined);
        }}
        overflowVisible
      >
        {timeLog[Number(timeLogIndex)] && (
          <>
            <InputField
              label={t('start_date')}
              type="date"
              value={parseTimeToDate(timeLog[timeLogIndex!][LogPosition.Start])}
              onValueChange={(value) =>
                handleDateChange(
                  timeLog[timeLogIndex!][LogPosition.Start],
                  value,
                  timeLogIndex!,
                  LogPosition.Start
                )
              }
            />

            <InputField
              label={t('start_time')}
              type="time"
              step="1"
              value={parseTime(timeLog[timeLogIndex!][LogPosition.Start])}
              onValueChange={(value) =>
                handleTimeChange(
                  timeLog[timeLogIndex!][LogPosition.Start],
                  value,
                  LogPosition.Start,
                  timeLogIndex!
                )
              }
            />

            {company?.show_task_end_date && (
              <InputField
                label={t('end_date')}
                type="date"
                value={parseTimeToDate(timeLog[timeLogIndex!][LogPosition.End])}
                onValueChange={(value) =>
                  handleDateChange(
                    timeLog[timeLogIndex!][LogPosition.End],
                    value,
                    timeLogIndex!,
                    LogPosition.End
                  )
                }
              />
            )}

            <InputField
              type="time"
              step="1"
              label={t('end_time')}
              value={parseTime(timeLog[timeLogIndex!][LogPosition.End])}
              onValueChange={(value) =>
                handleTimeChange(
                  timeLog[timeLogIndex!][LogPosition.End],
                  value,
                  timeLogIndex!,
                  LogPosition.End
                )
              }
            />

            <InputField
              label={t('duration')}
              debounceTimeout={1000}
              value={duration(
                timeLog[timeLogIndex!][LogPosition.Start],
                timeLog[timeLogIndex!][LogPosition.End],
                company?.show_task_end_date
              )}
              onValueChange={(value) =>
                handleDurationChange(
                  value,
                  timeLog[timeLogIndex!][LogPosition.Start],
                  timeLogIndex!
                )
              }
            />
          </>
        )}

        <div className="flex justify-end">
          <Button onClick={() => setIsTimeModalVisible(false)}>
            {t('done')}
          </Button>
        </div>
      </Modal>

      <TabGroup tabs={[t('details'), t('times')]} width="full">
        <div>
          <div className="px-4 space-y-4">
            <ClientSelector
              inputLabel={t('client')}
              value={task?.client_id}
              onChange={(client) => handleChange('client_id', client.id)}
            />

            <ProjectSelector
              inputLabel={t('project')}
              value={task?.project_id}
              onChange={(project) => handleChange('project_id', project.id)}
            />

            <UserSelector
              inputLabel={t('user')}
              value={task?.assigned_user_id}
              onChange={(user) => handleChange('assigned_user_id', user.id)}
            />

            <InputField
              label={t('task_number')}
              value={task?.number}
              onValueChange={(number) => handleChange('number', number)}
            />

            <InputField
              label={t('rate')}
              value={task?.rate}
              onValueChange={(rate) => handleChange('rate', rate)}
            />

            <TaskStatusSelector
              inputLabel={t('status')}
              value={task?.status_id}
              onChange={(taskStatus: TaskStatus) =>
                taskStatus && handleChange('status_id', taskStatus.id)
              }
              onClearButtonClick={() => handleChange('status_id', '')}
            />

            <InputField
              element="textarea"
              value={task?.description}
              onValueChange={(value) => handleChange('description', value)}
            />
          </div>
        </div>

        <div>
          {task &&
            formatTimeLog(task.time_log).map(([date, start, end], i) => (
              <ClickableElement
                key={i}
                onClick={() => {
                  setIsTimeModalVisible(true);
                  setTimeLogIndex(i);
                }}
              >
                <div>
                  <p>{formatDate(date, dateFormat)}</p>

                  <small>
                    {start} - {end}
                  </small>
                </div>
              </ClickableElement>
            ))}
        </div>
      </TabGroup>

      <div className="flex justify-end p-4">
        <Button onClick={() => task && save(task)}>{t('save')}</Button>
      </div>
    </>
  );
}
