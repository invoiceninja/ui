/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { useTitle } from 'common/hooks/useTitle';
import {
  deletePassword,
  injectInChanges,
  resetChanges,
  updateUser,
} from 'common/stores/slices/user';
import { RootState } from 'common/stores/store';
import { PasswordConfirmation } from 'components/PasswordConfirmation';
import { Tabs } from 'components/Tabs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { Settings } from '../../../components/layouts/Settings';
import { useUserDetailsTabs } from './common/hooks/useUserDetailsTabs';
import axios from 'axios';
import { updateRecord } from 'common/stores/slices/company-users';
import { toast } from 'common/helpers/toast/toast';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';

export function UserDetails() {
  useTitle('user_details');

  const [t] = useTranslation();

  const tabs = useUserDetailsTabs();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('user_details'), href: '/settings/user_details' },
  ];

  const user = useCurrentUser();

  const dispatch = useDispatch();

  const company = useInjectCompanyChanges();

  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState(false);

  const userState = useSelector((state: RootState) => state.user);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSave = (password: string, passwordIsRequired: boolean) => {
    toast.processing();

    axios
      .all([
        request(
          'PUT',
          endpoint('/api/v1/users/:id?include=company_user', { id: user!.id }),
          userState.changes,
          { headers: { 'X-Api-Password': password } }
        ),
        request(
          'PUT',
          endpoint('/api/v1/companies/:id', { id: company?.id }),
          company
        ),
      ])
      .then((response) => {
        toast.success('updated_settings');

        dispatch(updateUser(response[0].data.data));

        window.dispatchEvent(new CustomEvent('user.updated'));

        dispatch(
          updateRecord({ object: 'company', data: response[1].data.data })
        );
      })
      .catch((error) => {
        if (error.response?.status === 412) {
          toast.error('password_error_incorrect');
        } else {
          console.error(error);
          toast.error();
        }
      })
      .finally(() => dispatch(deletePassword()));
  };

  useEffect(() => {
    dispatch(injectInChanges());
  }, [user]);

  return (
    <Settings
      onSaveClick={() => setPasswordConfirmModalOpen(true)}
      onCancelClick={() => dispatch(resetChanges())}
      title={t('user_details')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#user_details"
    >
      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setPasswordConfirmModalOpen}
        onSave={onSave}
      />
      <Tabs tabs={tabs} className="mt-6" />

      <div className="my-4">
        <Outlet />
      </div>
    </Settings>
  );
}
