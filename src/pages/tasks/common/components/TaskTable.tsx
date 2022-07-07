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
            ([start, stop], index) => (
              <Tr key={index}>
                <Td>
                  <InputField type="date" value={parseTimeToDate(start)} />
                </Td>
                <Td>
                  <InputField type="time" value={parseTime(start)} />
                </Td>
                <Td>
                  <InputField type="time" value={parseTime(stop || 0)} />
                </Td>
                <Td>{difference(start, stop)}</Td>
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
