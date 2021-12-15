/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  Table as TableElement,
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
    <TableElement>
      <Thead>
        <Th>{t('name')}</Th>
        <Th>{t('date')}</Th>
        <Th>{t('type')}</Th>
        <Th>{t('size')}</Th>
        <Th></Th>
      </Thead>
      <Tbody>
        <Tr>
          <Td></Td>
        </Tr>
      </Tbody>
    </TableElement>
  );
}
