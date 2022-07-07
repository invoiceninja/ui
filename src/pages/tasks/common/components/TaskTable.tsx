/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InputField } from '@invoiceninja/forms';
import { Table, Tbody, Td, Th, Thead, Tr } from '@invoiceninja/tables';
import { Task } from 'common/interfaces/task';
import dayjs from 'dayjs';
import { Plus } from 'react-feather';
import { useTranslation } from 'react-i18next';

interface Props {
  task: Task;
  handleChange: (property: keyof Task, value: unknown) => unknown;
}

export function TaskTable(props: Props) {
  const { task, handleChange } = props;

  const [t] = useTranslation();

  const createTableRow = () => {
    console.log('Click!');
  };

  const parseTimeToDate = (timestamp: number) => {
    return dayjs.unix(timestamp).format('YYYY-MM-DD');
  };

  const parseTime = (timestamp: number) => {
    if (timestamp === 0) {
      return;
    }

    return dayjs.unix(timestamp).format('hh:mm:ss');
  };

  const difference = (start: number, stop: number) => {
    const diff = dayjs.unix(stop).diff(dayjs.unix(start), 'seconds');

    if (diff < 0) {
      return;
    }

    return new Date(diff * 1000).toISOString().slice(11, 19);
  };

  const handleTimeChange = (
    unix: number,
    time: string,
    position: number,
    index: number
  ) => {
    const date = parseTimeToDate(unix);

    const unixTimestamp = dayjs(
      `${date} ${time}`,
      'YYYY-MM-DD hh:mm:ss'
    ).unix();

    const logs = JSON.parse(task.time_log);

    logs[index][position] = unixTimestamp;

    handleChange('time_log', JSON.stringify(logs));
  };

  const handleDateChange = (unix: number, value: string, index: number) => {
    console.log(unix, value, index);

    const date = parseTimeToDate(unix);
    const time = parseTime(unix);

    const unixTimestamp = dayjs(
      `${date} ${time}`,
      'YYYY-MM-DD hh:mm:ss'
    ).unix();

    const logs = JSON.parse(task.time_log);

    logs[index][0] = unixTimestamp;

    handleChange('time_log', JSON.stringify(logs));
  };

  return (
    <Table>
      <Thead>
        <Th>{t('start_date')}</Th>
        <Th>{t('start_time')}</Th>
        <Th>{t('end_time')}</Th>
        <Th>{t('duration')}</Th>
      </Thead>
      <Tbody>
        {task.time_log &&
          (JSON.parse(task.time_log) as number[][]).map(
            ([start, stop], index, { length }) => (
              <Tr key={index}>
                <Td>
                  <InputField
                    type="date"
                    value={parseTimeToDate(start)}
                    onValueChange={(value) =>
                      handleDateChange(start, value, index)
                    }
                  />
                </Td>
                <Td>
                  <InputField
                    type="time"
                    value={parseTime(start)}
                    onValueChange={(value) =>
                      handleTimeChange(start, value, 0, index)
                    }
                    step="1"
                  />
                </Td>
                <Td>
                  <InputField
                    type="time"
                    value={parseTime(stop || 0)}
                    onValueChange={(value) =>
                      handleTimeChange(start, value, 1, index)
                    }
                    step="1"
                  />
                </Td>
                <Td>
                  {difference(start, stop)}

                  {/* {length - 1 === index && (
                    <button
                      className="ml-2 text-gray-600 hover:text-red-600"
                      // onClick={() => props.onDeleteRowClick(lineItemIndex)}
                    >
                      <Trash2 size={18} />
                    </button>
                  )} */}
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
