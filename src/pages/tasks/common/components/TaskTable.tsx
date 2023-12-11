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
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'react-feather';
import { useTranslation } from 'react-i18next';
import {
  duration,
  handleTaskDateChange,
  handleTaskDurationChange,
  handleTaskTimeChange,
  parseTimeToDate,
} from '../helpers';
import { parseTimeLog, TimeLogsType } from '../helpers/calculate-time';
import { parseTime } from '../helpers';
import { useColorScheme } from '$app/common/colors';

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

export function TaskTable(props: Props) {
  const { task, handleChange } = props;

  const [t] = useTranslation();

  const colors = useColorScheme();

  const company = useCurrentCompany();

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
        <Th>{t('start_date')}</Th>
        <Th>{t('start_time')}</Th>
        {company?.show_task_end_date && <Th>{t('end_date')}</Th>}
        <Th>{t('end_time')}</Th>
        <Th>{t('duration')}</Th>
        {company?.settings.allow_billable_task_items && (
          <Th>{t('billable')}</Th>
        )}
        <Th></Th>
      </Thead>
      <Tbody>
        {task.time_log &&
          (JSON.parse(task.time_log) as TimeLogsType).map(
            ([start, stop, description, billable], index) => (
              <>
                <Tr>
                  <Td>
                    <InputField
                      style={{ color: colors.$3, colorScheme: colors.$0 }}
                      type="date"
                      value={parseTimeToDate(start)}
                      onValueChange={(value) =>
                        handleDateChange(start, value, index, LogPosition.Start)
                      }
                    />
                  </Td>

                  <Td>
                    <InputField
                      style={{ color: colors.$3, colorScheme: colors.$0 }}
                      type="time"
                      step="1"
                      value={parseTime(start)}
                      onValueChange={(value) =>
                        handleTimeChange(start, value, LogPosition.Start, index)
                      }
                    />
                  </Td>

                  {company?.show_task_end_date && (
                    <Td>
                      <InputField
                        style={{ color: colors.$3, colorScheme: colors.$0 }}
                        type="date"
                        value={parseTimeToDate(stop)}
                        onValueChange={(value) =>
                          handleDateChange(stop, value, index, LogPosition.End)
                        }
                      />
                    </Td>
                  )}

                  <Td>
                    <InputField
                      style={{ color: colors.$3, colorScheme: colors.$0 }}
                      type="time"
                      step="1"
                      value={parseTime(stop) || 0}
                      onValueChange={(value) =>
                        handleTimeChange(stop, value, LogPosition.End, index)
                      }
                    />
                  </Td>

                  <Td>
                    <InputField
                      debounceTimeout={1000}
                      value={duration(start, stop, company?.show_task_end_date)}
                      onValueChange={(value) =>
                        handleDurationChange(value, start, index)
                      }
                    />
                  </Td>

                  {company?.settings.allow_billable_task_items && (
                    <Td>
                      <Checkbox
                        style={{ color: colors.$3, colorScheme: colors.$0 }}
                        checked={billable || typeof billable === 'undefined'}
                        onValueChange={(value, checked) =>
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
                    <button
                      style={{ color: colors.$3 }}
                      className="ml-2 text-gray-600 hover:text-red-600"
                      onClick={() => deleteTableRow(index)}
                    >
                      <Trash2 size={18} />
                    </button>
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

        <Tr className="bg-slate-100 hover:bg-slate-200">
          <Td colSpan={100}>
            <button
              onClick={createTableRow}
              className="w-full py-2 inline-flex justify-center items-center space-x-2"
            >
              <Plus size={18} />
              <span>{t('add_item')}</span>
            </button>
          </Td>
        </Tr>
      </Tbody>
    </Table>
  );
}
