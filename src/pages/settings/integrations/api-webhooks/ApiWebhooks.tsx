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
import { useTitle } from 'common/hooks/useTitle';
import { ApiWebhook } from 'common/interfaces/api-webhook';
import { bulk, useApiWebhooksQuery } from 'common/queries/api-webhooks';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Settings } from 'components/layouts/Settings';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath } from 'react-router-dom';

export function ApiWebhooks() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
    { name: t('api_webhooks'), href: '/settings/integrations/api_webhooks' },
  ];

  useTitle('api_webhooks');

  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<string>('10');
  const sort = 'id|asc';

  const { data } = useApiWebhooksQuery({
    currentPage,
    perPage,
    sort,
  });

  const archive = (id: string) => {
    const toastId = toast.loading(t('processing'));

    bulk([id], 'archive')
      .then(() => {
        toast.success(t('archived_webhook'), { id: toastId });

        queryClient.invalidateQueries('/api/v1/webhooks');
      })
      .catch((error: AxiosError) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      });
  };

  return (
    <Settings title={t('api_webhooks')} breadcrumbs={pages}>
      <div className="flex justify-end">
        <Button to="/settings/integrations/api_webhooks/create">
          <span>{t('new_webhook')}</span>
        </Button>
      </div>

      <Table>
        <Thead>
          <Th>{t('endpoint')}</Th>
          <Th>{t('method')}</Th>
          <Th></Th>
        </Thead>
        <Tbody data={data} showHelperPlaceholders>
          {data?.data?.data.map(
            (webhook: ApiWebhook) =>
              !webhook.is_deleted &&
              !webhook.archived_at && (
                <Tr key={webhook.id}>
                  <Td>
                    <Link
                      to={generatePath(
                        '/settings/integrations/api_webhooks/:id/edit',
                        { id: webhook.id }
                      )}
                    >
                      {webhook.target_url}
                    </Link>
                  </Td>
                  <Td>{webhook.rest_method.toUpperCase()}</Td>
                  <Td>
                    <Dropdown label={t('actions')}>
                      <DropdownElement onClick={() => archive(webhook.id)}>
                        {t('archive')}
                      </DropdownElement>

                      <DropdownElement
                        to={generatePath(
                          '/settings/integrations/api_webhooks/:id/edit',
                          { id: webhook.id }
                        )}
                      >
                        {t('edit_webhook')}
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
