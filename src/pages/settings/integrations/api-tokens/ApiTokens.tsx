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
import { ApiToken } from 'common/interfaces/api-token';
import { bulk, useApiTokensQuery } from 'common/queries/api-tokens';
import { Breadcrumbs } from 'components/Breadcrumbs';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Settings } from 'components/layouts/Settings';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { route } from 'common/helpers/route';
import { Icon } from 'components/icons/Icon';
import { MdArchive, MdEdit } from 'react-icons/md';

export function ApiTokens() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

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

  const archive = (id: string) => {
    toast.loading(t('processing'));

    bulk([id], 'archive')
      .then(() => {
        toast.dismiss();
        toast.success(t('archived_token'));
      })
      .catch((error: AxiosError) => {
        toast.dismiss();
        toast.success(t('error_title'));

        console.error(error);
      })
      .finally(() => queryClient.invalidateQueries('/api/v1/tokens'));
  };

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
            data.data.data.map(
              (token: ApiToken) =>
                !token.is_system &&
                !token.archived_at && (
                  <Tr key={token.id}>
                    <Td>
                      <Link
                        to={route(
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
                          to={route(
                            '/settings/integrations/api_tokens/:id/edit',
                            { id: token.id }
                          )}
                          icon={<Icon element={MdEdit} />}
                        >
                          {t('edit')}
                        </DropdownElement>

                        <DropdownElement
                          onClick={() => archive(token.id)}
                          icon={<Icon element={MdArchive} />}
                        >
                          {t('archive')}
                        </DropdownElement>
                      </Dropdown>
                    </Td>
                  </Tr>
                )
            )}
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
