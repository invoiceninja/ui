/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ClickableElement } from '@invoiceninja/cards';
import { Button, InputField } from '@invoiceninja/forms';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Task } from 'common/interfaces/task';
import { TaskStatus } from 'common/interfaces/task-status';
import { ClientSelector } from 'components/clients/ClientSelector';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { Modal } from 'components/Modal';
import { ProjectSelector } from 'components/projects/ProjectSelector';
import { TabGroup } from 'components/TabGroup';
import { UserSelector } from 'components/users/UserSelector';
import { useAtom } from 'jotai';
import { LogPosition } from 'pages/tasks/common/components/TaskTable';
import {
  duration,
  handleTaskDateChange,
  handleTaskDurationChange,
  handleTaskTimeChange,
  parseTime,
  parseTimeToDate,
} from 'pages/tasks/common/helpers';
import { parseTimeLog } from 'pages/tasks/common/helpers/calculate-time';
import { useSave } from 'pages/tasks/common/hooks';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currentTaskAtom } from '../common/atoms';
import { useFormatTimeLog } from '../common/hooks';

export function EditSlider() {
  const [t] = useTranslation();
  const [task, setTask] = useAtom(currentTaskAtom);

  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);

  const [timeLogIndex, setTimeLogIndex] = useState<number>();
  const [timeLog, setTimeLog] = useState<number[][]>([]);

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
  }, [timeLogIndex]);

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
              value={parseTime(timeLog[timeLogIndex!][LogPosition.Start])}
              onValueChange={(value) =>
                handleTimeChange(
                  timeLog[timeLogIndex!][LogPosition.Start],
                  value,
                  LogPosition.Start,
                  timeLogIndex!
                )
              }
              step="1"
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
              label={t('end_time')}
              type="time"
              value={parseTime(timeLog[timeLogIndex!][LogPosition.End])}
              onValueChange={(value) =>
                handleTimeChange(
                  timeLog[timeLogIndex!][LogPosition.End],
                  value,
                  timeLogIndex!,
                  LogPosition.End
                )
              }
              step="1"
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

            <DebouncedCombobox
              inputLabel={t('status')}
              endpoint="/api/v1/task_statuses"
              label="name"
              onChange={(value: Record<TaskStatus>) =>
                value.resource && handleChange('status_id', value.resource.id)
              }
              defaultValue={task?.status_id}
              queryAdditional
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
                  <p>{date}</p>

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
