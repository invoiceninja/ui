/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '@invoiceninja/forms';
import {
  Pagination,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@invoiceninja/tables';
import { Settings } from 'components/layouts/Settings';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function UserManagement() {
  const [t] = useTranslation();
  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('user_management'), href: '/settings/user_management' },
  ];
  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'user_management'
    )}`;
  });

  return (
    <Settings title={t('user_management')}
    breadcrumbs={pages}
    docsLink='docs/advanced-settings/#user_management'
    >
      <div className="flex justify-end mt-4 lg:mt-0">
        <Button to="/users/create">Create user</Button>
      </div>

      <Table>
        <Thead>
          <Th>{t('category')}</Th>
          <Th>{t('total')}</Th>
          <Th>{t('action')}</Th>
        </Thead>
        <Tbody>
          <Tr>
            <Td colSpan={3}>{t('empty_table')}</Td>
          </Tr>
        </Tbody>
      </Table>

      <Pagination
        currentPage={1}
        onPageChange={() => {}}
        onRowsChange={() => {}}
        totalPages={1}
      />
    </Settings>
  );
}
