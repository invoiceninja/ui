/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { TaskStatus } from 'common/interfaces/task-status';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

export function TaskStatuses() {
  const [t] = useTranslation();

  const columns: DataTableColumns = [
    {
      id: 'name',
      label: t('name'),
      format: (value, taskStatus: TaskStatus) => (
        <Link
          to={generatePath('/settings/task_statuses/:id/edit', {
            id: taskStatus.id,
          })}
        >
          {value}
        </Link>
      ),
    },
    {
      id: 'color',
      label: t('color'),
      format: (value) => (
        <div
          className="w-10 h-4 border border-gray-300 rounded-sm"
          style={{ backgroundColor: value.toString() }}
        ></div>
      ),
    },
  ];

  return (
    <DataTable
      resource="task_status"
      columns={columns}
      endpoint="/api/v1/task_statuses"
      linkToCreate="/settings/task_statuses/create"
      linkToEdit="/settings/task_statuses/:id/edit"
      withResourcefulActions
    />
  );
}
