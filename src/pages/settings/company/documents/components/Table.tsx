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
import { Document } from 'common/interfaces/document.interface';
import { useDocumentsQuery } from 'common/queries/documents';
import { Spinner } from 'components/Spinner';
import { useTranslation } from 'react-i18next';

export function Table() {
  const [t] = useTranslation();
  const { data } = useDocumentsQuery();

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
        {!data && (
          <Tr>
            <Td colSpan={5}>
              <Spinner />
            </Td>
          </Tr>
        )}

        {data &&
          data.data.data.map((document: Document) => (
            <Tr>
              <Td>{document.name}</Td>
              <Td>{document.updated_at}</Td>
              <Td>{document.type}</Td>
              <Td>{document.size}</Td>
              <Td></Td>
            </Tr>
          ))}
      </Tbody>
    </TableElement>
  );
}
