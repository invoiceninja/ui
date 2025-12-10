/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { request } from '$app/common/helpers/request';
import { endpoint, isHosted } from '$app/common/helpers';
import { $refetch } from '$app/common/hooks/useRefetch';
import dayjs from 'dayjs';
import { cloneDeep, set } from 'lodash';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { resetChanges, updateUser } from '$app/common/stores/slices/user';
import { useDispatch } from 'react-redux';
import { CompanyUser } from '$app/common/interfaces/company-user';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { Icon } from '../icons/Icon';
import { MdClose } from 'react-icons/md';
import { Link } from '../forms';
import { useColorScheme } from '$app/common/colors';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useEffect, useState } from 'react';
import { useCompanyUsers } from '$app/common/hooks/useCompanyUsers';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';

export function PriceIncreaseBanner() {
  const [t] = useTranslation();

  const dispatch = useDispatch();
  const refreshCompanyUsers = useRefreshCompanyUsers();

  const { isOwner } = useAdmin();
  const colors = useColorScheme();
  const currentUser = useCurrentUser();
  const companyUsers = useCompanyUsers();
  const reactSettings = useReactSettings();

  const [shouldDisplayBanner, setShouldDisplayBanner] = useState<boolean>();

  const handleDismiss = () => {
    setShouldDisplayBanner(false);

    const currentUnixTime = dayjs().utc().unix();

    const updatedReactSettings = cloneDeep(reactSettings);

    set(
      updatedReactSettings,
      'preferences.price_increase_banner_dismissed_at',
      currentUnixTime
    );

    request(
      'PUT',
      endpoint('/api/v1/company_users/:id/preferences?include=company_user', {
        id: currentUser?.id,
      }),
      {
        react_settings: updatedReactSettings,
      }
    ).then((response: GenericSingleResourceResponse<CompanyUser>) => {
      $refetch(['company_users']);

      dispatch(updateUser(response.data.data));
      dispatch(resetChanges());

      refreshCompanyUsers();
    });
  };

  const handleClick = () => {
    handleDismiss();
  };

  useEffect(() => {
    if (companyUsers.length > 0 && typeof shouldDisplayBanner === 'undefined') {
      const isAnyCompanyUserHasPriceIncreaseBannerDismissed = companyUsers.some(
        (companyUser) =>
          companyUser.react_settings?.preferences
            ?.price_increase_banner_dismissed_at
      );

      setShouldDisplayBanner(!isAnyCompanyUserHasPriceIncreaseBannerDismissed);
    }
  }, [companyUsers]);

  if (!isHosted()) {
    return null;
  }

  if (!isOwner) {
    return null;
  }

  if (!shouldDisplayBanner || typeof shouldDisplayBanner === 'undefined') {
    return null;
  }

  const now = dayjs();
  const isDecember2025 = now.year() === 2025 && now.month() === 11;

  if (!isDecember2025) {
    return null;
  }

  return (
    <div className="max-w-max rounded-lg bg-[#DBEAFE] px-6 py-4 shadow-lg">
      <div className="flex items-center justify-center space-x-2">
        <span className="text-sm font-medium">{t('price_changes')}</span>

        <button type="button" onClick={handleClick}>
          <Link
            to="https://invoiceninja.com/pricing-update-january-1-2026/"
            external
            withoutExternalIcon
          >
            {t('learn_more')}
          </Link>
        </button>

        <div
          className="cursor-pointer hover:opacity-75 pl-4"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
        >
          <Icon element={MdClose} style={{ color: colors.$3 }} />
        </div>
      </div>
    </div>
  );
}
