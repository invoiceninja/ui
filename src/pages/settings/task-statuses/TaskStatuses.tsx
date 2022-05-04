/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
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
import { AxiosError } from 'axios';
import { TaskStatus } from 'common/interfaces/task-status';
import { bulk, useTaskStatusesQuery } from 'common/queries/task-statuses';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath } from 'react-router-dom';

export function TaskStatuses() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<string>('10');

  const sort = 'id|asc';

  const { data } = useTaskStatusesQuery({
    currentPage,
    perPage,
    sort,
  });

  const archive = (id: string) => {
    toast.loading(t('processing'));

    bulk([id], 'archive')
      .then(() => {
        toast.dismiss();
        toast.success(t('archived_task_status'));
      })
      .catch((error: AxiosError) => {
        toast.dismiss();
        toast.success(t('error_title'));

        console.error(error);
      })
      .finally(() => queryClient.invalidateQueries('/api/v1/task_statuses'));
  };
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
                    <DropdownElement onClick={() => archive(taskStatus.id)}>
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
