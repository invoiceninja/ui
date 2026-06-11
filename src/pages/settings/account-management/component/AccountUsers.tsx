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
import { Badge, BadgeVariant } from '$app/components/Badge';
import { Icon } from '$app/components/icons/Icon';
import { Spinner } from '$app/components/Spinner';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import { useQuery } from 'react-query';

const ACCOUNT_USERS_ENDPOINT = '/api/client/account_management/users';

interface AccountCompany {
  id: string;
  name: string;
  permissions: string | string[] | null;
  status: string;
  is_owner?: boolean;
  is_admin?: boolean;
}

interface AccountUser {
  id: string;
  name: string;
  email: string;
  status: string;
  companies: AccountCompany[];
}

const permissionActions = ['create', 'view', 'edit'];
const specialPermissions = ['view_dashboard', 'view_reports', 'disable_emails'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown) {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : '';
}

function getNestedCompanyName(value: Record<string, unknown>) {
  const company = value.company;

  if (!isRecord(company)) {
    return '';
  }

  const settings = company.settings;

  return (
    (isRecord(settings) && asString(settings.name)) ||
    asString(company.name) ||
    ''
  );
}

function normalizeCompany(value: unknown): AccountCompany | null {
  if (!isRecord(value)) {
    return null;
  }

  const pivot = isRecord(value.pivot) ? value.pivot : undefined;
  const companyUser = isRecord(value.company_user) ? value.company_user : pivot;

  const permissions =
    value.permissions ??
    companyUser?.permissions ??
    (companyUser?.is_owner ? 'Owner' : companyUser?.is_admin ? 'Admin' : '');

  const id =
    asString(value.id) ||
    asString(value.company_id) ||
    asString(companyUser?.company_id);

  const name =
    asString(value.name) ||
    getNestedCompanyName(value) ||
    asString(value.company_name);

  return {
    id,
    name,
    permissions: Array.isArray(permissions)
      ? permissions.map(asString).filter(Boolean)
      : asString(permissions),
    status: asString(value.status) || asString(companyUser?.status),
    is_owner: Boolean(value.is_owner || companyUser?.is_owner),
    is_admin: Boolean(value.is_admin || companyUser?.is_admin),
  };
}

function normalizeUser(value: unknown): AccountUser | null {
  if (!isRecord(value)) {
    return null;
  }

  const companies: AccountCompany[] = [];

  if (Array.isArray(value.companies)) {
    value.companies.forEach((company) => {
      const normalizedCompany = normalizeCompany(company);

      if (normalizedCompany) {
        companies.push(normalizedCompany);
      }
    });
  }

  if (isRecord(value.company_user)) {
    const normalizedCompany = normalizeCompany(value.company_user);

    if (normalizedCompany) {
      companies.push(normalizedCompany);
    }
  }

  if (Array.isArray(value.company_users)) {
    value.company_users.forEach((companyUser) => {
      const normalizedCompany = normalizeCompany(companyUser);

      if (normalizedCompany) {
        companies.push(normalizedCompany);
      }
    });
  }

  const seen = new Set<string>();
  const uniqueCompanies = companies.filter((company) => {
    const key = company.id || company.name;

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });

  const firstName = asString(value.first_name);
  const lastName = asString(value.last_name);

  return {
    id: asString(value.id),
    name:
      asString(value.name) ||
      `${firstName} ${lastName}`.trim() ||
      asString(value.email),
    email: asString(value.email),
    status: asString(value.status),
    companies: uniqueCompanies,
  };
}

function resolveUsers(payload: unknown): AccountUser[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeUser).filter(Boolean) as AccountUser[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.data)) {
    return payload.data.map(normalizeUser).filter(Boolean) as AccountUser[];
  }

  if (Array.isArray(payload.users)) {
    return payload.users.map(normalizeUser).filter(Boolean) as AccountUser[];
  }

  if (isRecord(payload.data) && Array.isArray(payload.data.data)) {
    return payload.data.data
      .map(normalizeUser)
      .filter(Boolean) as AccountUser[];
  }

  return [];
}

function normalizePermissions(permissions?: string | string[] | null) {
  if (Array.isArray(permissions)) {
    return permissions.filter(Boolean);
  }

  return (permissions || '')
    .split(',')
    .map((permission) => permission.trim())
    .filter(Boolean);
}

export function AccountUsers() {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const ownerLabel =
    String(t('owner')) === 'owner' ? 'Owner' : String(t('owner'));
  const adminLabel =
    String(t('admin')) === 'admin' ? 'Admin' : String(t('admin'));
  const administratorLabel = String(t('administrator'));
  const customLabel = String(t('custom'));
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
      request('POST', endpoint(ACCOUNT_USERS_ENDPOINT)).then((response) =>
        resolveUsers(response.data)
      ),
    { staleTime: Infinity }
  );

  const sortedUsers = useMemo(
    () =>
      [...users].sort((first, second) => first.name.localeCompare(second.name)),
    [users]
  );

  const isOwnerPermission = (value: string) =>
    [ownerLabel, 'owner'].includes(value.toLowerCase()) ||
    value.toLowerCase() === ownerLabel.toLowerCase();

  const isAdminPermission = (value: string) =>
    [adminLabel, administratorLabel, 'admin', 'administrator']
      .map((label) => label.toLowerCase())
      .includes(value.toLowerCase());

  const getStatusVariant = (status: string): BadgeVariant => {
    const normalizedStatus = status.toLowerCase();

    if (
      normalizedStatus.includes('inactive') ||
      normalizedStatus.includes('deleted')
    ) {
      return 'red';
    }

    if (normalizedStatus.includes('active')) {
      return 'primary';
    }

    if (normalizedStatus.includes('pending')) {
      return 'yellow';
    }

    return 'generic';
  };

  const getPermissionVariant = (summary: string): BadgeVariant => {
    if (isOwnerPermission(summary)) {
      return 'purple';
    }

    if (isAdminPermission(summary)) {
      return 'primary';
    }

    if (summary.toLowerCase() === customLabel.toLowerCase()) {
      return 'blue';
    }

    return 'generic';
  };

  const humanizePermission = (permission: string) =>
    permission
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase());

  const formatPermission = (permission: string) => {
    if (isOwnerPermission(permission)) {
      return ownerLabel;
    }

    if (isAdminPermission(permission)) {
      return adminLabel;
    }

    if (specialPermissions.includes(permission)) {
      const translatedPermission = String(t(permission));

      return translatedPermission === permission
        ? humanizePermission(permission)
        : translatedPermission;
    }

    const [action, ...moduleParts] = permission.split('_');
    const module = moduleParts.join('_');

    if (permissionActions.includes(action) && module) {
      return `${String(t(action))} ${String(t(module))}`;
    }

    const translatedPermission = String(t(permission));

    return translatedPermission === permission
      ? humanizePermission(permission)
      : translatedPermission;
  };

  const getPermissionLabels = (company: AccountCompany) => {
    if (company.is_owner) {
      return [ownerLabel];
    }

    if (company.is_admin) {
      return [adminLabel];
    }

    const permissions = normalizePermissions(company.permissions);

    if (!permissions.length) {
      return [noAccessLabel];
    }

    return permissions.map(formatPermission);
  };

  const renderFieldLabel = (label: string) => (
    <div
      className="text-xs font-medium uppercase tracking-wide"
      style={{ color: colors.$17 }}
    >
      {label}
    </div>
  );

  const renderStatusBadge = (status: string) =>
    status ? (
      <Badge variant={getStatusVariant(status)}>{status}</Badge>
    ) : (
      <span className="text-sm" style={{ color: colors.$17 }}>
        {t('unknown')}
      </span>
    );

  const renderPermissionBadges = (company: AccountCompany) => {
    const permissions = getPermissionLabels(company);

    return (
      <div className="flex flex-wrap gap-2">
        {permissions.map((permission) => (
          <Badge key={permission} variant={getPermissionVariant(permission)}>
            {permission}
          </Badge>
        ))}
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
        {user.companies.map((company, index) => {
          return (
            <div
              key={`${company.id || company.name || index}`}
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
          {!sortedUsers.length && (
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

          {sortedUsers.map((user) => {
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

                  <Td>
                    {user.status && (
                      <Badge variant={getStatusVariant(user.status)}>
                        {user.status}
                      </Badge>
                    )}
                  </Td>
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
