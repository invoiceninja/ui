/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { useTitle } from 'common/hooks/useTitle';
import { defaultHeaders } from 'common/queries/common/headers';
import {
  deletePassword,
  resetChanges,
  updateUser,
} from 'common/stores/slices/user';
import { RootState } from 'common/stores/store';
import { PasswordConfirmation } from 'components/PasswordConfirmation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Settings } from '../../../components/layouts/Settings';
import { AccentColor, Details, Notifications, Password } from './components';
import { TwoFactorAuthentication } from './components/TwoFactorAuthentication';

export function UserDetails() {
  useTitle('user_details');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('user_details'), href: '/settings/user_details' },
  ];

  const user = useCurrentUser();
  const dispatch = useDispatch();

  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState(false);

  const userState = useSelector((state: RootState) => state.user);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSave = (password: string, passwordIsRequired: boolean) => {
    toast.loading(t('processing'));

    axios
      .put(
        endpoint('/api/v1/users/:id?include=company_user', { id: user.id }),
        userState.changes,
        {
          headers: { 'X-Api-Password': password, ...defaultHeaders() },
        }
      )
      .then((response) => {
        toast.dismiss();
        toast.success(t('updated_settings'));

        dispatch(updateUser(response.data.data));

        window.dispatchEvent(new CustomEvent('user.updated'));
      })
      .catch((error: AxiosError) => {
        console.error(error);

        toast.dismiss();

        error.response?.status === 412
          ? toast.error(t('password_error_incorrect'))
          : toast.error(t('error_title'));
      })
      .finally(() => dispatch(deletePassword()));
  };

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

      <Details />
      <Password />
      {/* <Connect /> */}
      <TwoFactorAuthentication />
      <AccentColor />
      <Notifications />
    </Settings>
  );
}
