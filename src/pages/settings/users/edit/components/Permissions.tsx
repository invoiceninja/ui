/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Checkbox } from '@invoiceninja/forms';
import { User } from 'common/interfaces/user';
import Toggle from 'components/forms/Toggle';
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
            />
          </div>
          <div className="col-1">
            <Checkbox
              checked={isPermissionChecked('view_all')}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                handlePermissionChange('view_all', event.target.checked)
              }
            />
          </div>
          <div className="col-1">
            <Checkbox
              checked={isPermissionChecked('edit_all')}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                handlePermissionChange('edit_all', event.target.checked)
              }
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
              />
            </div>
          </div>
        </Element>
      ))}
    </Card>
  );
}
