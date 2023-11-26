/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useTitle } from '$app/common/hooks/useTitle';
import {
  injectInChanges,
  resetChanges,
  updateUser,
} from '$app/common/stores/slices/user';
import { RootState } from '$app/common/stores/store';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { Tabs } from '$app/components/Tabs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { Settings } from '../../../components/layouts/Settings';
import { useUserDetailsTabs } from './common/hooks/useUserDetailsTabs';
import axios, { AxiosError } from 'axios';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { toast } from '$app/common/helpers/toast/toast';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { useAtom, useSetAtom } from 'jotai';
import { lastPasswordEntryTimeAtom } from '$app/common/atoms/password-confirmation';
import { usePreferences } from '$app/common/hooks/usePreferences';
import { TwoFactorAuthenticationModals } from './common/components/TwoFactorAuthenticationModals';
import { hasLanguageChanged as hasLanguageChangedAtom } from '$app/pages/settings/localization/common/atoms';
import { $refetch } from '$app/common/hooks/useRefetch';

export function UserDetails() {
  useTitle('user_details');

  const [t] = useTranslation();

  const tabs = useUserDetailsTabs();

  const [errors, setErrors] = useState<ValidationBag>();

  const [checkVerification, setCheckVerification] = useState<boolean>(false);

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('user_details'), href: '/settings/user_details' },
  ];

  const [hasLanguageChanged, setHasLanguageIdChanged] = useAtom(
    hasLanguageChangedAtom
  );

  const user = useCurrentUser();

  const dispatch = useDispatch();

  const company = useInjectCompanyChanges();

  const setLastPasswordEntryTime = useSetAtom(lastPasswordEntryTimeAtom);

  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState(false);

  const userState = useSelector((state: RootState) => state.user);

  const { isAdmin } = useAdmin();
  const { save } = usePreferences();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSave = (password: string, passwordIsRequired: boolean) => {
    toast.processing();
    setErrors(undefined);

    const requests = [
      request(
        'PUT',
        endpoint('/api/v1/users/:id?include=company_user', { id: user!.id }),
        userState.changes,
        { headers: { 'X-Api-Password': password } }
      ),
    ];

    if (isAdmin) {
      requests.push(
        request(
          'PUT',
          endpoint('/api/v1/companies/:id', { id: company?.id }),
          company
        )
      );
    }

    axios
      .all(requests)
      .then((response) => {
        toast.success('updated_settings');

        $refetch(['users']);

        if (hasLanguageChanged) {
          $refetch(['statics']);
          setHasLanguageIdChanged(false);
        }

        if (
          response[0].data.data.phone !== user?.phone &&
          user?.google_2fa_secret &&
          !response[0].data.data.verified_phone_number
        ) {
          setCheckVerification(true);
        }

        dispatch(updateUser(response[0].data.data));

        window.dispatchEvent(new CustomEvent('user.updated'));

        isAdmin &&
          dispatch(
            updateRecord({ object: 'company', data: response[1].data.data })
          );
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 412) {
          toast.error('password_error_incorrect');
          setLastPasswordEntryTime(0);
        }

        if (error.response?.status == 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      });

    save({ silent: true });
  };

  useEffect(() => {
    dispatch(injectInChanges());
  }, [user]);

  return (
    <>
      <Settings
        onSaveClick={() => setPasswordConfirmModalOpen(true)}
        onCancelClick={() => dispatch(resetChanges())}
        title={t('user_details')}
        breadcrumbs={pages}
        docsLink="en/basic-settings/#user_details"
        withoutBackButton
      >
        <PasswordConfirmation
          show={isPasswordConfirmModalOpen}
          onClose={setPasswordConfirmModalOpen}
          onSave={onSave}
        />

        <Tabs tabs={tabs} className="mt-6" />

        <div className="my-4">
          <Outlet context={errors} />
        </div>
      </Settings>

      <TwoFactorAuthenticationModals
        checkVerification={checkVerification}
        setCheckVerification={setCheckVerification}
        checkOnlyPhoneNumberVerification
      />
    </>
  );
}
