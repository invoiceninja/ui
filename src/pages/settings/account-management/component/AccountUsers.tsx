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
import { Icon } from '$app/components/icons/Icon';
import { Spinner } from '$app/components/Spinner';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
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
  const noCompanyAccessLabel = 'No company access';

  const [expandedUserId, setExpandedUserId] = useState<string>();

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
  const getPermissionsDisplay = (company: AccountCompany) => {
    if (company.is_owner) {
      return 'owner';
    }
    if (company.is_admin) {
      return 'admin';
    }
    return company.permissions.trim() || noAccessLabel;
  };

  const renderFieldLabel = (label: string) => (
    <div
      className="text-xs font-medium uppercase tracking-wide"
      style={{ color: colors.$17 }}
    >
      {label}
    </div>
  );

  const renderStatusBadge = (status: string) => (
    <div>
      {status ? (
        <Badge>{status}</Badge>
      ) : (
        <span className="text-sm" style={{ color: colors.$17 }}>
          {t('unknown')}
        </span>
      )}
    </div>
  );

  const renderPermissionBadges = (company: AccountCompany) => {
    const permissions = getPermissionsDisplay(company);

    return (
      <div className="flex flex-wrap gap-2">
        <Badge>{permissions}</Badge>
      </div>
    );
  };

  const renderCompanyDetails = (user: AccountUser) => {
    if (!user.companies.length) {
      return (
        <div className="px-4 py-5 text-sm" style={{ color: colors.$17 }}>
          {noCompanyAccessLabel}
        </div>
      );
    }

    return (
      <div className="space-y-3 px-4 py-4">
        {user.companies.map((company) => {
          return (
            <div
              key={company.id}
              className="rounded-md border px-4 py-4"
              style={{ borderColor: colors.$20 }}
            >
              <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_10rem_minmax(0,2fr)]">
                <div className="min-w-0 space-y-1">
                  {renderFieldLabel(String(t('company')))}
                  <div className="truncate text-sm font-medium">
                    {company.name || t('unknown')}
                  </div>
                </div>

                <div className="space-y-1">
                  {renderFieldLabel(String(t('status')))}
                  {renderStatusBadge(company.status)}
                </div>

                <div className="min-w-0 space-y-1">
                  {renderFieldLabel(String(t('permissions')))}
                  {renderPermissionBadges(company)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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
          <Th className="w-10"></Th>
          <Th>{t('user')}</Th>
          <Th>{t('status')}</Th>
        </Thead>

        <Tbody>
          {!users.length && (
            <Tr>
              <Td colSpan={3}>
                <div className="flex items-center justify-center py-10">
                  <span className="text-sm" style={{ color: colors.$17 }}>
                    {t('no_records_found')}
                  </span>
                </div>
              </Td>
            </Tr>
          )}

          {users.map((user) => {
            const expanded = expandedUserId === user.id;
            const detailsId = `account-user-companies-${user.id}`;

            return (
              <Fragment key={user.id}>
                <Tr
                  className="border-b"
                  style={{ borderColor: colors.$20 }}
                  withoutBackgroundColor
                >
                  <Td>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-md border"
                      style={{
                        borderColor: colors.$24,
                        backgroundColor: colors.$1,
                      }}
                      aria-expanded={expanded}
                      aria-controls={detailsId}
                      aria-label={`${expanded ? 'Collapse' : 'Expand'} ${
                        user.name
                      }`}
                      onClick={() =>
                        setExpandedUserId((current) =>
                          current === user.id ? undefined : user.id
                        )
                      }
                    >
                      <Icon
                        element={expanded ? MdExpandLess : MdExpandMore}
                        size={20}
                      />
                    </button>
                  </Td>

                  <Td>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{user.name}</div>
                      <div
                        className="truncate text-xs"
                        style={{ color: colors.$17 }}
                      >
                        {user.email}
                      </div>
                    </div>
                  </Td>

                  <Td>{user.status && <Badge>{user.status}</Badge>}</Td>
                </Tr>

                {expanded && (
                  <Tr
                    id={detailsId}
                    className="border-b"
                    style={{ borderColor: colors.$20 }}
                    withoutBackgroundColor
                  >
                    <Td colSpan={3} withoutPadding>
                      {renderCompanyDetails(user)}
                    </Td>
                  </Tr>
                )}
              </Fragment>
            );
          })}
        </Tbody>
      </Table>
    </div>
  );
}
