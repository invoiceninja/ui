/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useColorScheme } from '$app/common/colors';
import { Badge } from '$app/components/Badge';
import { Modal } from '$app/components/Modal';
import { Spinner } from '$app/components/Spinner';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { Button } from '$app/components/forms';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';

const ACCOUNT_USERS_ENDPOINT = '/api/client/account_management/v2/users';

interface AccountCompany {
  id: string;
  name: string;
  permissions: string;
  is_owner: boolean;
  is_admin: boolean;
  is_locked: boolean;
  status: string;
}

interface AccountUser {
  id: string;
  name: string;
  email: string;
  status: string;
  companies: AccountCompany[];
}

interface AccountUsersResponse {
  users: AccountUser[];
}

export function AccountUsers() {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const noAccessLabel = 'No access';

  const [selectedUser, setSelectedUser] = useState<AccountUser | null>(null);

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery(
    ['account_management', 'users'],
    () =>
      request('POST', endpoint(ACCOUNT_USERS_ENDPOINT)).then(
        (response) => (response.data as AccountUsersResponse).users
      ),
    { staleTime: Infinity }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center px-6 py-10">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="px-6 py-8 text-center text-sm"
        style={{ color: colors.$17 }}
      >
        {t('error_refresh_page')}
      </div>
    );
  }

  return (
    <div className="px-4 pb-6 sm:px-6">
      <Table withoutPadding>
        <Thead>
          <Th>{t('user')}</Th>
          <Th>{t('email')}</Th>
          <Th>{t('status')}</Th>
          <Th>{t('companies')}</Th>
          <Th></Th>
        </Thead>

        <Tbody>
          {!users.length && (
            <Tr>
              <Td colSpan={5}>
                <div className="flex items-center justify-center py-10">
                  <span className="text-sm" style={{ color: colors.$17 }}>
                    {t('no_records_found')}
                  </span>
                </div>
              </Td>
            </Tr>
          )}

          {users.map((user) => (
            <Tr
              key={user.id}
              className="border-b"
              style={{ borderColor: colors.$20 }}
              withoutBackgroundColor
            >
              <Td>
                <div className="truncate font-medium">{user.name}</div>
              </Td>

              <Td>
                <div
                  className="truncate text-sm"
                  style={{ color: colors.$17 }}
                >
                  {user.email}
                </div>
              </Td>

              <Td>{user.status && <Badge>{t(user.status)}</Badge>}</Td>

              <Td>
                <span className="text-sm" style={{ color: colors.$17 }}>
                  {user.companies.length}
                </span>
              </Td>

              <Td>
                <Button
                  type="minimal"
                  behavior="button"
                  onClick={() => setSelectedUser(user)}
                >
                  {t('view_details')}
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal
        title={selectedUser?.name || ''}
        visible={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        size="regular"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: colors.$20 }}>
              <div>
                <div className="text-sm font-medium">{selectedUser.name}</div>
                <div className="text-sm" style={{ color: colors.$17 }}>
                  {selectedUser.email}
                </div>
              </div>
              {selectedUser.status && <Badge>{t(selectedUser.status)}</Badge>}
            </div>

            {!selectedUser.companies.length && (
              <div className="text-sm" style={{ color: colors.$17 }}>
                No company access
              </div>
            )}

            {selectedUser.companies.map((company) => (
              <div
                key={company.id}
                className="rounded-md border px-4 py-4"
                style={{ borderColor: colors.$20 }}
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <div
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{ color: colors.$17 }}
                    >
                      {t('company')}
                    </div>
                    <div className="truncate text-sm font-medium">
                      {company.name || t('unknown')}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{ color: colors.$17 }}
                    >
                      {t('status')}
                    </div>
                    <div>
                      {company.status ? (
                        <Badge>{company.status}</Badge>
                      ) : (
                        <span className="text-sm" style={{ color: colors.$17 }}>
                          {t('unknown')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{ color: colors.$17 }}
                    >
                      {t('permissions')}
                    </div>
                    <Badge>
                      {company.is_owner
                        ? 'owner'
                        : company.is_admin
                          ? 'admin'
                          : company.permissions.trim() || noAccessLabel}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
