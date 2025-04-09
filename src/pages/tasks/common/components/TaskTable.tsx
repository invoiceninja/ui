/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Checkbox, InputField } from '$app/components/forms';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Task } from '$app/common/interfaces/task';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  duration,
  handleTaskDurationChange,
  parseTimeToDate,
  useHandleTaskDateChange,
  useHandleTaskTimeChange,
} from '../helpers';
import { parseTimeLog, TimeLogsType } from '../helpers/calculate-time';
import { parseTime } from '../helpers';
import { useColorScheme } from '$app/common/colors';
import { DurationClock } from './DurationClock';
import { isTaskRunning } from '../helpers/calculate-entity-state';
import { useStart } from '../hooks/useStart';
import dayjs from 'dayjs';
import { CircleXMark } from '$app/components/icons/CircleXMark';
import styled from 'styled-components';
import classNames from 'classnames';
import { Plus } from '$app/components/icons/Plus';

interface Props {
  task: Task;
  handleChange: (property: keyof Task, value: unknown) => unknown;
}

export enum LogPosition {
  Start = 0,
  End = 1,
  Description = 2,
  Billable = 3,
}

const AddItemButton = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export function TaskTable(props: Props) {
  const { task, handleChange } = props;

  const [t] = useTranslation();

  const colors = useColorScheme();
  const start = useStart();
  const company = useCurrentCompany();

  const handleTaskTimeChange = useHandleTaskTimeChange();
  const handleTaskDateChange = useHandleTaskDateChange();

  const [lastChangedIndex, setLastChangedIndex] = useState<number>();

  const createTableRow = () => {
    const logs = parseTimeLog(task.time_log);
    const last = logs.at(-1);

    let startTime = dayjs().unix();

    if (last && last[1] !== 0) {
      startTime = last[1] + 1;
    }

    logs.push([startTime, 0, '', true]);

    handleChange('time_log', JSON.stringify(logs));
  };

  const deleteTableRow = (index: number) => {
    const logs: TimeLogsType = parseTimeLog(task.time_log);

    logs.splice(index, 1);

    handleChange('time_log', JSON.stringify(logs));
  };

  const handleTimeChange = (
    unix: number,
    time: string,
    position: number,
    index: number
  ) => {
    setLastChangedIndex(index);

    handleChange(
      'time_log',
      handleTaskTimeChange(task.time_log, unix, time, position, index)
    );
  };

  const handleDateChange = (
    unix: number,
    value: string,
    index: number,
    position: number
  ) => {
    setLastChangedIndex(index);

    handleChange(
      'time_log',
      handleTaskDateChange(task.time_log, unix, value, index, position)
    );
  };

  const handleDurationChange = (
    value: string,
    start: number,
    index: number
  ) => {
    setLastChangedIndex(index);

    handleChange(
      'time_log',
      handleTaskDurationChange(task.time_log, value, start, index)
    );
  };

  const handleDescriptionChange = (
    value: string,
    index: number,
    logPosition: number
  ) => {
    const logs = parseTimeLog(task.time_log);

    logs[index][logPosition] = value;

    handleChange('time_log', JSON.stringify(logs));
  };

  const handleBillableChange = (
    value: boolean,
    index: number,
    logPosition: number
  ) => {
    const logs = parseTimeLog(task.time_log);

    logs[index][logPosition] = value;

    handleChange('time_log', JSON.stringify(logs));
  };

  const isValidTimeFormat = (value: string) => {
    const parts = value.split(':');

    return parts.length === 3 && parts.every((part) => part.length === 2);
  };

  const isValidDateFormat = (value: string) => {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    return datePattern.test(value);
  };

  const getDescriptionColSpan = () => {
    let colSpan = 4;

    if (company?.show_task_end_date) {
      colSpan += 1;
    }

    if (company?.settings.allow_billable_task_items) {
      colSpan += 1;
    }

    return colSpan;
  };

  useEffect(() => {
    if (typeof lastChangedIndex === 'number') {
      const parsedTimeLog = parseTimeLog(task.time_log);

      const startTime =
        parsedTimeLog[lastChangedIndex] && parsedTimeLog[lastChangedIndex][0];
      const endTime =
        parsedTimeLog[lastChangedIndex] && parsedTimeLog[lastChangedIndex][1];

      if (startTime && endTime && startTime > endTime) {
        parsedTimeLog[lastChangedIndex][1] = startTime;

        handleChange('time_log', JSON.stringify(parsedTimeLog));
      }

      setLastChangedIndex(undefined);
    }
  }, [lastChangedIndex]);

  return (
    <Table>
      <Thead>
        <Th className="px-3" withoutHorizontalPadding>
          {t('start_date')}
        </Th>
        <Th className="px-3" withoutHorizontalPadding>
          {t('start_time')}
        </Th>
        {company?.show_task_end_date && (
          <Th className="px-3" withoutHorizontalPadding>
            {t('end_date')}
          </Th>
        )}
        <Th className="px-3" withoutHorizontalPadding>
          {t('end_time')}
        </Th>
        <Th className="px-3" withoutHorizontalPadding>
          {t('duration')}
        </Th>
        {company?.settings.allow_billable_task_items && (
          <Th className="pl-16 pr-3" withoutHorizontalPadding>
            {t('billable')}
          </Th>
        )}
        <Th withoutHorizontalPadding></Th>
      </Thead>
      <Tbody>
        {task.time_log &&
          (JSON.parse(task.time_log) as TimeLogsType).map(
            ([start, stop, description, billable], index) => (
              <>
                <Tr
                  className="border-b"
                  style={{
                    borderColor: colors.$20,
                  }}
                >
                  <Td className="pl-3 py-3" withoutPadding>
                    <InputField
                      key={`${dayjs().unix().toString()}StartDate`}
                      style={{ color: colors.$3, colorScheme: colors.$0 }}
                      type="date"
                      value={parseTimeToDate(start)}
                      onValueChange={(value) =>
                        handleDateChange(
                          start,
                          isValidDateFormat(value)
                            ? value
                            : parseTimeToDate(start) || '',
                          index,
                          LogPosition.Start
                        )
                      }
                    />
                  </Td>

                  <Td className="pl-3 py-3" withoutPadding>
                    <InputField
                      key={`${dayjs().unix().toString()}StartTime`}
                      style={{ color: colors.$3, colorScheme: colors.$0 }}
                      type="time"
                      step="1"
                      value={parseTime(start)}
                      onValueChange={(value) =>
                        handleTimeChange(
                          start,
                          isValidTimeFormat(value)
                            ? value
                            : parseTime(start) || '',
                          LogPosition.Start,
                          index
                        )
                      }
                    />
                  </Td>

                  {company?.show_task_end_date && (
                    <Td className="pl-3 py-3" withoutPadding>
                      <InputField
                        key={`${dayjs().unix().toString()}EndDate`}
                        style={{ color: colors.$3, colorScheme: colors.$0 }}
                        type="date"
                        value={parseTimeToDate(stop)}
                        onValueChange={(value) =>
                          handleDateChange(
                            stop,
                            value
                              ? isValidDateFormat(value)
                                ? value
                                : parseTimeToDate(stop) || ''
                              : parseTimeToDate(stop) ||
                                  parseTimeToDate(start) ||
                                  '',
                            index,
                            LogPosition.End
                          )
                        }
                      />
                    </Td>
                  )}

                  <Td className="pl-3 py-3" withoutPadding>
                    <InputField
                      key={`${dayjs().unix().toString()}EndTime`}
                      style={{ color: colors.$3, colorScheme: colors.$0 }}
                      type="time"
                      step="1"
                      value={parseTime(stop)}
                      onValueChange={(value) =>
                        handleTimeChange(
                          stop,
                          value
                            ? isValidTimeFormat(value)
                              ? value
                              : parseTime(stop) || ''
                            : parseTime(stop) || parseTime(start) || '',
                          LogPosition.End,
                          index
                        )
                      }
                    />
                  </Td>

                  <Td className="pl-3 py-3" withoutPadding>
                    {stop !== 0 || task.created_at === 0 ? (
                      <InputField
                        debounceTimeout={1000}
                        value={duration(
                          start,
                          stop,
                          company?.show_task_end_date
                        )}
                        onValueChange={(value) =>
                          handleDurationChange(value, start, index)
                        }
                      />
                    ) : (
                      <DurationClock
                        start={start}
                        key={`duration-clock-${index}`}
                        task={task}
                      />
                    )}
                  </Td>

                  {company?.settings.allow_billable_task_items && (
                    <Td className="pl-16 py-3" withoutPadding>
                      <Checkbox
                        style={{ color: colors.$3, colorScheme: colors.$0 }}
                        checked={billable || typeof billable === 'undefined'}
                        onValueChange={(_, checked) =>
                          handleBillableChange(
                            checked || false,
                            index,
                            LogPosition.Billable
                          )
                        }
                      />
                    </Td>
                  )}

                  <Td
                    rowSpan={
                      company?.settings.show_task_item_description ? 2 : 1
                    }
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => deleteTableRow(index)}
                    >
                      <CircleXMark
                        color={colors.$3}
                        hoverColor={colors.$3}
                        borderColor={colors.$5}
                        hoverBorderColor={colors.$17}
                        size="1.6rem"
                      />
                    </div>
                  </Td>
                </Tr>

                {company?.settings.show_task_item_description && (
                  <Tr>
                    <Td colSpan={getDescriptionColSpan()}>
                      <InputField
                        element="textarea"
                        textareaRows={2}
                        value={description}
                        onValueChange={(value) =>
                          handleDescriptionChange(
                            value,
                            index,
                            LogPosition.Description
                          )
                        }
                      />
                    </Td>
                  </Tr>
                )}
              </>
            )
          )}

        <Tr>
          <Td colSpan={100} className="p-1" withoutPadding>
            <AddItemButton
              className={classNames(
                'w-full py-4 inline-flex justify-center items-center space-x-2 rounded-[0.1875rem]',
                {
                  'cursor-not-allowed':
                    isTaskRunning(task) && task.created_at !== 0,
                  'cursor-pointer':
                    !isTaskRunning(task) || task.created_at === 0,
                }
              )}
              onClick={() => {
                if (isTaskRunning(task) && task.created_at !== 0) {
                  return;
                }

                if (task.created_at) {
                  start(task);
                } else {
                  createTableRow();
                }
              }}
              theme={{
                backgroundColor: colors.$1,
                hoverBackgroundColor: colors.$20,
              }}
            >
              {isTaskRunning(task) && task.created_at !== 0 ? (
                <span>{t('stop_task_to_add_task_entry')}</span>
              ) : (
                <div className="flex items-center space-x-2">
                  <div>
                    <Plus size="1.15rem" color={colors.$17} />
                  </div>

                  <span className="font-medium">{t('add_item')}</span>
                </div>
              )}
            </AddItemButton>
          </Td>
        </Tr>
      </Tbody>
    </Table>
  );
}
