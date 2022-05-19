/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Table, Tbody, Th, Thead } from '@invoiceninja/tables';
import { Upload } from 'pages/settings/company/documents/components';
import { useTranslation } from 'react-i18next';

export function Documents() {
  const [t] = useTranslation();

  return (
    <>
      <Upload apiEndpoint="/api/v1/projects/:id/upload" />

      <Table>
        <Thead>
          <Th>{t('name')}</Th>
          <Th>{t('date')}</Th>
          <Th>{t('type')}</Th>
          <Th>{t('size')}</Th>
        </Thead>
        <Tbody></Tbody>
      </Table>
    </>
  );
}
