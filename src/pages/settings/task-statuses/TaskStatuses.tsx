/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, Link } from '@invoiceninja/forms';
import {
  Pagination,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@invoiceninja/tables';
import { TaskStatus } from 'common/interfaces/task-status';
import { useTaskStatusesQuery } from 'common/queries/task-statuses';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

export function TaskStatuses() {
  const [t] = useTranslation();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<string>('10');

  const sort = 'id|asc';

  const { data } = useTaskStatusesQuery({
    currentPage,
    perPage,
    sort,
  });

  console.log(data);

  return (
    <>
      <div className="flex justify-end mt-8">
        <Button to="/settings/task_statuses/create">
          {t('new_task_status')}
        </Button>
      </div>

      <Table>
        <Thead>
          <Th>{t('name')}</Th>
          <Th>{t('color')}</Th>
          <Th></Th>
        </Thead>
        <Tbody data={data} showHelperPlaceholders>
          {data &&
            data.data.data.map((taskStatus: TaskStatus) => (
              <Tr key={taskStatus.id}>
                <Td>
                  <Link
                    to={generatePath('/settings/task_statuses/:id/edit', {
                      id: taskStatus.id,
                    })}
                  >
                    {taskStatus.name}
                  </Link>
                </Td>
                <Td>
                  <span
                    className="px-6 border"
                    style={{ backgroundColor: taskStatus.color }}
                  ></span>
                </Td>
                <Td>
                  <Dropdown label={t('actions')}>
                    <DropdownElement
                      to={generatePath('/settings/task_statuses/:id/edit', {
                        id: taskStatus.id,
                      })}
                    >
                      {t('edit_task_status')}
                    </DropdownElement>
                    <DropdownElement onClick={() => {}}>
                      {t('archive_status')}
                    </DropdownElement>
                  </Dropdown>
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>

      {data && (
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRowsChange={setPerPage}
          totalPages={data.data.meta.pagination.total_pages}
        />
      )}
    </>
  );
}
