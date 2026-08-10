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
import { useEffect, useLayoutEffect, useState } from 'react';
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
import { useAtom, useAtomValue } from 'jotai';
import {
  reactSettingsAtom,
  useUserDetailsDraft,
} from '$app/common/hooks/useReactSettings';
import { TwoFactorAuthenticationModals } from './common/components/TwoFactorAuthenticationModals';
import { hasLanguageChanged as hasLanguageChangedAtom } from '$app/pages/settings/localization/common/atoms';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useOnWrongPasswordEnter } from '$app/common/hooks/useOnWrongPasswordEnter';
import { resetChanges as resetCompanyChanges } from '$app/common/stores/slices/company-users';
import { Card } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';

export function UserDetails() {
  useTitle('user_details');

  const [t] = useTranslation();
  const dispatch = useDispatch();

  const user = useCurrentUser();
  const { isAdmin } = useAdmin();
  const colors = useColorScheme();
  const tabs = useUserDetailsTabs();
  const company = useInjectCompanyChanges();

  const onWrongPasswordEnter = useOnWrongPasswordEnter();

  const [errors, setErrors] = useState<ValidationBag>();
  const [checkVerification, setCheckVerification] = useState<boolean>(false);

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('user_details'), href: '/settings/user_details' },
  ];

  const [hasLanguageChanged, setHasLanguageIdChanged] = useAtom(
    hasLanguageChangedAtom
  );

  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState<boolean>(false);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const userState = useSelector((state: RootState) => state.user);
  const rawReactSettings = useAtomValue(reactSettingsAtom);
  const isReactSettingsHydrated = rawReactSettings !== null;
  const userDetailsDraft = useUserDetailsDraft();

  useLayoutEffect(() => {
    if (isReactSettingsHydrated) {
      userDetailsDraft.begin();
    }

    return () => {
      userDetailsDraft.discard();
    };
  }, [user?.id, isReactSettingsHydrated, userDetailsDraft]);

  const resetUserDetailsDraft = () => {
    userDetailsDraft.discard();
    userDetailsDraft.begin();
  };

  const onSave = (password: string, passwordIsRequired: boolean) => {
    if (isFormBusy) {
      return;
    }

    setIsFormBusy(true);

    toast.processing();
    setErrors(undefined);

    // `react_settings` is owned by the dedicated `/preferences` endpoint.
    const userChanges = { ...userState.changes };
    if (userChanges.company_user) {
      userChanges.company_user = { ...userChanges.company_user };
      delete userChanges.company_user.react_settings;
    }

    const userRequests = [
      request(
        'PUT',
        endpoint('/api/v1/users/:id?include=company_user', { id: user!.id }),
        userChanges,
        { headers: { 'X-Api-Password': password } }
      ),
    ];

    if (isAdmin) {
      userRequests.push(
        request(
          'PUT',
          endpoint('/api/v1/companies/:id', { id: company?.id }),
          company
        )
      );
    }

    let preferencesFlushed = true;

    userDetailsDraft
      .commit()
      .catch(() => {
        preferencesFlushed = false;
      })
      .then(() => axios.all(userRequests))
      .then((response) => {
        if (preferencesFlushed) {
          toast.success('updated_settings');
          userDetailsDraft.begin();
        } else {
          toast.error();
        }

        $refetch(['users']);

        if (hasLanguageChanged) {
          $refetch(['statics']);
          setHasLanguageIdChanged(false);
        }

        const userResponse = response[0];

        if (
          userResponse.data.data.phone !== user?.phone &&
          user?.google_2fa_secret &&
          !userResponse.data.data.verified_phone_number
        ) {
          setCheckVerification(true);
        }

        dispatch(updateUser(userResponse.data.data));
        dispatch(resetChanges());

        window.dispatchEvent(new CustomEvent('user.updated'));

        if (isAdmin) {
          dispatch(
            updateRecord({ object: 'company', data: response[1].data.data })
          );

          dispatch(resetCompanyChanges('company'));
        }
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 412) {
          onWrongPasswordEnter(passwordIsRequired);
          setPasswordConfirmModalOpen(true);
        }

        if (error.response?.status == 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      })
      .finally(() => setIsFormBusy(false));
  };

  useEffect(() => {
    dispatch(injectInChanges());
  }, [user]);

  return (
    <>
      <Settings
        onSaveClick={() => setPasswordConfirmModalOpen(true)}
        onCancelClick={() => {
          dispatch(resetChanges());
          resetUserDetailsDraft();
        }}
        title={t('user_details')}
        breadcrumbs={pages}
        docsLink="en/basic-settings/#user_details"
        disableSaveButton={isFormBusy}
      >
        <PasswordConfirmation
          show={isPasswordConfirmModalOpen}
          onClose={setPasswordConfirmModalOpen}
          onSave={onSave}
        />

        <Card
          className="shadow-sm"
          title={t('user_details')}
          withoutBodyPadding
          withoutHeaderBorder
          style={{ borderColor: colors.$24 }}
        >
          <Tabs
            tabs={tabs}
            withHorizontalPadding
            fullRightPadding
            withHorizontalPaddingOnSmallScreen
          />

          <div className="pt-4 pb-8">
            <Outlet context={errors} />
          </div>
        </Card>
      </Settings>

      <TwoFactorAuthenticationModals
        checkVerification={checkVerification}
        setCheckVerification={setCheckVerification}
        checkOnlyPhoneNumberVerification
      />
    </>
  );
}
