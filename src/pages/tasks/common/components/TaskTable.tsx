/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InputField } from '$app/components/forms';
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
  parseTime,
  parseTimeToDate,
} from '../helpers';
import { parseTimeLog } from '../helpers/calculate-time';

interface Props {
  task: Task;
  handleChange: (property: keyof Task, value: unknown) => unknown;
}

export enum LogPosition {
  Start = 0,
  End = 1,
}

export function TaskTable(props: Props) {
  const { task, handleChange } = props;

  const [t] = useTranslation();

  const company = useCurrentCompany();

  const [lastChangedIndex, setLastChangedIndex] = useState<number>();

  const createTableRow = () => {
    const logs = parseTimeLog(task.time_log);
    const last = logs.at(-1);

    let startTime = dayjs().unix();

    if (last && last[1] !== 0) {
      startTime = last[1] + 1;
    }

    logs.push([startTime, 0]);

    handleChange('time_log', JSON.stringify(logs));
  };

  const deleteTableRow = (index: number) => {
    const logs: number[][] = parseTimeLog(task.time_log);

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

  useEffect(() => {
    if (typeof lastChangedIndex === 'number') {
      const parsedTimeLog = parseTimeLog(task.time_log);

      const startTime = parsedTimeLog[lastChangedIndex][0];
      const endTime = parsedTimeLog[lastChangedIndex][1];

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
      </Thead>
      <Tbody>
        {task.time_log &&
          (JSON.parse(task.time_log) as number[][]).map(
            ([start, stop], index) => (
              <Tr key={index}>
                <Td>
                  <InputField
                    type="date"
                    value={parseTimeToDate(start)}
                    onValueChange={(value) =>
                      handleDateChange(start, value, index, LogPosition.Start)
                    }
                  />
                </Td>
                <Td>
                  <InputField
                    type="time"
                    value={parseTime(start)}
                    onValueChange={(value) =>
                      handleTimeChange(start, value, LogPosition.Start, index)
                    }
                    step="1"
                  />
                </Td>
                {company?.show_task_end_date && (
                  <Td>
                    <InputField
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
                    type="time"
                    value={parseTime(stop || 0)}
                    onValueChange={(value) =>
                      handleTimeChange(stop, value, LogPosition.End, index)
                    }
                    step="1"
                  />
                </Td>
                <Td width="15%">
                  <div className="flex items-center space-x-4">
                    <InputField
                      debounceTimeout={1000}
                      value={duration(start, stop, company?.show_task_end_date)}
                      onValueChange={(value) =>
                        handleDurationChange(value, start, index)
                      }
                    />

                    <button
                      className="ml-2 text-gray-600 hover:text-red-600"
                      onClick={() => deleteTableRow(index)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Td>
              </Tr>
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
