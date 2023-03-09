/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '$app/components/forms';
import {
  Pagination,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '$app/components/tables';
import { Settings } from '$app/components/layouts/Settings';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function GroupSettings() {
  const [t] = useTranslation();
  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('group_settings'), href: '/settings/group_settings' },
  ];
  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'group_settings'
    )}`;
  });

  return (
    <Settings
      title={t('group_settings')}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#group_settings"
    >
      <div className="flex justify-end mt-4 lg:mt-0">
        <Button to="/group_settings/create">Create group</Button>
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
