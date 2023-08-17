/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { Checkbox } from '$app/components/forms';
import { User } from '$app/common/interfaces/user';
import Toggle from '$app/components/forms/Toggle';
import { clone } from 'lodash';
import { useTranslation } from 'react-i18next';

interface Props {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
}

export function Permissions(props: Props) {
  const [t] = useTranslation();
  const { user, setUser } = props;

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

  const handleAdministratorToggle = (value: boolean) => {
    setUser(
      (user) =>
        user && {
          ...user,
          company_user: user.company_user && {
            ...user.company_user,
            is_admin: value,
          },
        }
    );
  };

  const isPermissionChecked = (permission: string) => {
    const permissions = user?.company_user?.permissions;
    const [type] = permission.split('_');

    if (permissions && permissions.includes(`${type}_all`)) {
      return true;
    }

    if (permissions && permissions.includes(permission)) {
      return true;
    }

    return false;
  };

  const handlePermissionChange = (permission: string, value: boolean) => {
    const permissions = clone(user?.company_user?.permissions ?? '')
      .split(',')
      .filter((value) => value !== permission);

    if (value) {
      permissions.push(permission);
    }

    if (permissions[0] === '') {
      permissions.shift();
    }

    setUser(
      (user) =>
        user && {
          ...user,
          company_user: user.company_user && {
            ...user.company_user,
            permissions: permissions.join(','),
          },
        }
    );
  };

  return (
    <Card title={t('permissions')}>
      <Element
        leftSide={t('administrator')}
        leftSideHelp={t('administrator_help')}
      >
        <Toggle
          checked={user?.company_user?.is_admin}
          onChange={(value) => handleAdministratorToggle(value)}
        />
      </Element>

      <Element leftSide={t('view_dashboard')}>
        <Toggle
          checked={isPermissionChecked('view_dashboard')}
          onValueChange={(value) =>
            handlePermissionChange('view_dashboard', value)
          }
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
        />
      </Element>

      <Element>
        <div className="grid grid-cols-3 md:grid-cols-6">
          <div className="col-1">{t('create')}</div>
          <div className="col-1">{t('view')}</div>
          <div className="col-1">{t('edit')}</div>
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
            />
          </div>
          <div className="col-1">
            <Checkbox
              checked={isPermissionChecked('view_all')}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                handlePermissionChange('view_all', event.target.checked)
              }
              cypressRef="view_all"
            />
          </div>
          <div className="col-1">
            <Checkbox
              checked={isPermissionChecked('edit_all')}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                handlePermissionChange('edit_all', event.target.checked)
              }
              cypressRef="edit_all"
            />
          </div>
        </div>
      </Element>

      {permissions.map((permission, index) => (
        <Element key={index} leftSide={t(permission)}>
          <div className="grid grid-cols-3  md:grid-cols-6">
            <div className="col-1">
              <Checkbox
                checked={isPermissionChecked(`create_${permission}`)}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handlePermissionChange(
                    `create_${permission}`,
                    event.target.checked
                  )
                }
                cypressRef={`create_${permission}`}
              />
            </div>
            <div className="col-1">
              <Checkbox
                checked={isPermissionChecked(`view_${permission}`)}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handlePermissionChange(
                    `view_${permission}`,
                    event.target.checked
                  )
                }
                cypressRef={`view_${permission}`}
              />
            </div>
            <div className="col-1">
              <Checkbox
                checked={isPermissionChecked(`edit_${permission}`)}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handlePermissionChange(
                    `edit_${permission}`,
                    event.target.checked
                  )
                }
                cypressRef={`edit_${permission}`}
              />
            </div>
          </div>
        </Element>
      ))}
    </Card>
  );
}
