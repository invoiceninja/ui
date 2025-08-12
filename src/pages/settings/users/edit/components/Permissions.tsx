/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { Checkbox } from '$app/components/forms';
import { User } from '$app/common/interfaces/user';
import Toggle from '$app/components/forms/Toggle';
import { clone } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Permissions as PermissionsType } from '$app/common/hooks/permissions/useHasPermission';
import { useColorScheme } from '$app/common/colors';
import { Divider } from '$app/components/cards/Divider';

interface Props {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
}

const SPECIAL_PERMISSIONS = [
  'view_reports',
  'view_dashboard',
  'disable_emails',
];

export function Permissions(props: Props) {
  const [t] = useTranslation();
  const { user, setUser } = props;

  const colors = useColorScheme();

  const permissions = [
    'client',
    'product',
    'invoice',
    'payment',
    'recurring_invoice',
    'quote',
    'credit',
    'project',
    'task',
    'vendor',
    'expense',
    'bank_transaction',
    'purchase_order',
    'recurring_expense',
  ];

  const isPermissionDisabled = () => {
    if (user?.company_user?.is_admin) {
      return true;
    }

    return false;
  };

  const handleAdministratorToggle = (value: boolean) => {
    setUser(
      (user) =>
        user && {
          ...user,
          company_user: user.company_user && {
            ...user.company_user,
            is_admin: value,
            permissions: value ? '' : user.company_user.permissions,
          },
        }
    );
  };

  const isPermissionChecked = (permission: PermissionsType) => {
    if (user?.company_user?.is_admin) {
      return true;
    }

    const permissions = user?.company_user?.permissions;
    const [type] = permission.split('_');

    if (
      permissions &&
      permissions.includes(`${type}_all`) &&
      permission !== 'view_reports' &&
      permission !== 'view_dashboard' &&
      permission !== 'disable_emails'
    ) {
      return true;
    }

    if (permissions && permissions.includes(permission)) {
      return true;
    }

    return false;
  };

  const handlePermissionChange = (
    permission: PermissionsType,
    value: boolean
  ) => {
    let currentPermissions = clone(user?.company_user?.permissions ?? '')
      .split(',')
      .filter((value) => value !== permission);

    const [permissionType, entity] = permission.split('_');

    if (entity === 'all') {
      currentPermissions = currentPermissions.filter(
        (currentPermission) =>
          !currentPermission.startsWith(permissionType) ||
          SPECIAL_PERMISSIONS.includes(currentPermission)
      );
    } else if (
      currentPermissions.includes(`${permissionType}_all`) &&
      !SPECIAL_PERMISSIONS.includes(permission)
    ) {
      const permissionsByType = permissions
        .map((currentPermission) => `${permissionType}_${currentPermission}`)
        .filter((currentPermission) => currentPermission !== permission);

      currentPermissions = currentPermissions.filter(
        (currentPermission) => currentPermission !== `${permissionType}_all`
      );

      currentPermissions = [...currentPermissions, ...permissionsByType];
    }

    if (value) {
      currentPermissions.push(permission);
    }

    if (!currentPermissions.includes(`${permissionType}_all`)) {
      const permissionsFromTypeLength = currentPermissions.filter(
        (currentPermission) =>
          currentPermission.startsWith(permissionType) &&
          !SPECIAL_PERMISSIONS.includes(currentPermission)
      ).length;

      if (permissionsFromTypeLength === permissions.length) {
        currentPermissions = currentPermissions.filter(
          (currentPermission) =>
            !currentPermission.startsWith(permissionType) ||
            SPECIAL_PERMISSIONS.includes(currentPermission)
        );

        currentPermissions.push(`${permissionType}_all`);
      }
    }

    if (currentPermissions[0] === '') {
      currentPermissions.shift();
    }

    setUser(
      (user) =>
        user && {
          ...user,
          company_user: user.company_user && {
            ...user.company_user,
            permissions: currentPermissions.join(','),
          },
        }
    );
  };

  return (
    <>
      <Element
        leftSide={t('administrator')}
        leftSideHelp={t('administrator_help')}
      >
        <Toggle
          checked={user?.company_user?.is_admin}
          onChange={(value) => handleAdministratorToggle(value)}
          cypressRef="admin"
        />
      </Element>

      <Element leftSide={t('view_dashboard')}>
        <Toggle
          checked={isPermissionChecked('view_dashboard')}
          onValueChange={(value) =>
            handlePermissionChange('view_dashboard', value)
          }
          cypressRef="viewDashboard"
          disabled={isPermissionDisabled()}
        />
      </Element>

      <Element
        leftSide={t('reports')}
        leftSideHelp={t('view_report_permission')}
      >
        <Toggle
          checked={isPermissionChecked('view_reports')}
          onValueChange={(value) =>
            handlePermissionChange('view_reports', value)
          }
          cypressRef="viewReports"
          disabled={isPermissionDisabled()}
        />
      </Element>

      <Element
        leftSide={t('disable_emails')}
        leftSideHelp={t('disable_emails_help')}
      >
        <Toggle
          checked={isPermissionChecked('disable_emails')}
          onValueChange={(value) =>
            handlePermissionChange('disable_emails', value)
          }
          disabled={isPermissionDisabled()}
        />
      </Element>

      <div className="px-4 sm:px-6 py-4">
        <Divider
          className="border-dashed"
          withoutPadding
          borderColor={colors.$20}
        />
      </div>

      <Element>
        <div className="grid grid-cols-3 md:grid-cols-6">
          <div className="col-1" style={{ color: colors.$22 }}>
            {t('create')}
          </div>
          <div className="col-1" style={{ color: colors.$22 }}>
            {t('view')}
          </div>
          <div className="col-1" style={{ color: colors.$22 }}>
            {t('edit')}
          </div>
        </div>
      </Element>

      <Element leftSide={t('all')}>
        <div className="grid grid-cols-3  md:grid-cols-6">
          <div className="col-1">
            <Checkbox
              checked={isPermissionChecked('create_all')}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                handlePermissionChange('create_all', event.target.checked)
              }
              cypressRef="create_all"
              disabled={isPermissionDisabled()}
            />
          </div>
          <div className="col-1">
            <Checkbox
              checked={isPermissionChecked('view_all')}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                handlePermissionChange('view_all', event.target.checked)
              }
              cypressRef="view_all"
              disabled={isPermissionDisabled()}
            />
          </div>
          <div className="col-1">
            <Checkbox
              checked={isPermissionChecked('edit_all')}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                handlePermissionChange('edit_all', event.target.checked)
              }
              cypressRef="edit_all"
              disabled={isPermissionDisabled()}
            />
          </div>
        </div>
      </Element>

      {permissions.map((permission, index) => (
        <Element key={index} leftSide={t(permission)}>
          <div className="grid grid-cols-3  md:grid-cols-6">
            <div className="col-1">
              <Checkbox
                checked={isPermissionChecked(
                  `create_${permission}` as PermissionsType
                )}
                onValueChange={(_, checked) =>
                  handlePermissionChange(
                    `create_${permission}` as PermissionsType,
                    Boolean(checked)
                  )
                }
                cypressRef={`create_${permission}`}
                disabled={isPermissionDisabled()}
              />
            </div>
            <div className="col-1">
              <Checkbox
                checked={isPermissionChecked(
                  `view_${permission}` as PermissionsType
                )}
                onValueChange={(_, checked) =>
                  handlePermissionChange(
                    `view_${permission}` as PermissionsType,
                    Boolean(checked)
                  )
                }
                cypressRef={`view_${permission}`}
                disabled={isPermissionDisabled()}
              />
            </div>
            <div className="col-1">
              <Checkbox
                checked={isPermissionChecked(
                  `edit_${permission}` as PermissionsType
                )}
                onValueChange={(_, checked) =>
                  handlePermissionChange(
                    `edit_${permission}` as PermissionsType,
                    Boolean(checked)
                  )
                }
                cypressRef={`edit_${permission}`}
                disabled={isPermissionDisabled()}
              />
            </div>
          </div>
        </Element>
      ))}
    </>
  );
}
