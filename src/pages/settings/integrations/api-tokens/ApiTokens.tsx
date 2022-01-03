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
import { ApiToken } from 'common/interfaces/api-token';
import { useApiTokensQuery } from 'common/queries/api-tokens';
import { Breadcrumbs } from 'components/Breadcrumbs';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Settings } from 'components/layouts/Settings';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

export function ApiTokens() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
    {
      name: t('api_tokens'),
      href: '/settings/account_management/integrations/api_tokens',
    },
  ];

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('api_tokens')}`;
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<string>('10');

  const sort = 'id|asc';

  const { data } = useApiTokensQuery({
    currentPage,
    perPage,
    sort,
  });

  console.log(data);

  return (
    <Settings title={t('api_tokens')}>
      <Breadcrumbs pages={pages} />

      <div className="flex justify-end mt-8">
        <Button to="/settings/integrations/api_tokens/create">
          {t('new_token')}
        </Button>
      </div>

      <Table>
        <Thead>
          <Th>{t('name')}</Th>
          <Th></Th>
        </Thead>
        <Tbody data={data} showHelperPlaceholders>
          {data &&
            data.data.data.map((token: ApiToken) => (
              <Tr key={token.id}>
                <Td>
                  <Link
                    to={generatePath(
                      '/settings/integrations/api_tokens/:id/edit',
                      { id: token.id }
                    )}
                  >
                    {token.name}
                  </Link>
                </Td>
                <Td>
                  <Dropdown label={t('actions')}>
                    <DropdownElement
                      to={generatePath(
                        '/settings/integrations/api_tokens/:id/edit',
                        { id: token.id }
                      )}
                    >
                      {t('edit_token')}
                    </DropdownElement>
                    
                    <DropdownElement onClick={() => {}}>
                      {t('archive_token')}
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
    </Settings>
  );
}
