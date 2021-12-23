/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '@invoiceninja/forms';
import {
  Pagination,
  Table as TableComponent,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@invoiceninja/tables';
import { useTranslation } from 'react-i18next';

export function Table() {
  const [t] = useTranslation();

  return (
    <>
      <div className="flex justify-end mt-8">
        <Button to="/settings/tax_rates/create">{t('create_tax_rate')}</Button>
      </div>

      <TableComponent>
        <Thead>
          <Th>{t('name')}</Th>
          <Th>{t('rate')}</Th>
          <Th>{t('type')}</Th>
          <Th>{t('action')}</Th>
        </Thead>
        <Tbody>
          <Tr>
            <Td colSpan={4}>{t('empty_table')}</Td>
          </Tr>
        </Tbody>
      </TableComponent>

      <Pagination
        currentPage={1}
        onPageChange={() => {}}
        onRowsChange={() => {}}
        totalPages={1}
      />
    </>
  );
}
