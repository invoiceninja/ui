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
import { AxiosError } from 'axios';
import { ExpenseCategory } from 'common/interfaces/expense-category';
import {
  bulk,
  useExpenseCategoriesQuery,
} from 'common/queries/expense-categories';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath } from 'react-router-dom';

export function ExpenseCategories() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<string>('10');
  const sort = 'id|asc';

  const { data } = useExpenseCategoriesQuery({
    currentPage,
    perPage,
    sort,
  });

  const archive = (id: string) => {
    toast.loading(t('processing'));

    bulk([id], 'archive')
      .then(() => {
        toast.dismiss();
        toast.success(t('archived_expense_category'));
      })
      .catch((error: AxiosError) => {
        toast.dismiss();
        toast.success(t('error_title'));

        console.error(error);
      })
      .finally(() =>
        queryClient.invalidateQueries('/api/v1/expense_categories')
      );
  };

  return (
    <>
      <div className="flex justify-end mt-8">
        <Button to="/settings/expense_categories/create">
          {t('new_expense_category')}
        </Button>
      </div>

      <Table>
        <Thead>
          <Th>{t('category')}</Th>
          <Th>{t('total')}</Th>
          <Th>{t('action')}</Th>
        </Thead>
        <Tbody data={data} showHelperPlaceholders>
          {data &&
            data.data.data.map((category: ExpenseCategory) => (
              <Tr key={category.id}>
                <Td>
                  <Link
                    to={generatePath('/settings/expense_categories/:id/edit', {
                      id: category.id,
                    })}
                  >
                    {category.name}
                  </Link>
                </Td>
                <Td>0</Td>
                <Td>
                  <Dropdown label={t('actions')}>
                    <DropdownElement
                      to={generatePath(
                        '/settings/expense_categories/:id/edit',
                        {
                          id: category.id,
                        }
                      )}
                    >
                      {t('edit_expense_category')}
                    </DropdownElement>
                    <DropdownElement onClick={() => archive(category.id)}>
                      {t('archive_expense_category')}
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
