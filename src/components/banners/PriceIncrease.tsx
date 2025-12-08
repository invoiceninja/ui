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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { $refetch } from '$app/common/hooks/useRefetch';
import dayjs from 'dayjs';
import { cloneDeep, set } from 'lodash';
import { User } from '$app/common/interfaces/user';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { resetChanges, updateUser } from '$app/common/stores/slices/user';
import { useDispatch } from 'react-redux';
import { CompanyUser } from '$app/common/interfaces/company-user';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { Icon } from '../icons/Icon';
import { MdClose } from 'react-icons/md';
import { Link } from '../forms';
import { useColorScheme } from '$app/common/colors';

export function PriceIncreaseBanner() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const { isOwner } = useAdmin();

  const dispatch = useDispatch();

  const company = useCurrentCompany();
  const currentUser = useCurrentUser();

  const handleDismiss = () => {
    const user = cloneDeep(currentUser) as User;

    set(
      user,
      'company_user.react_settings.price_increase_banner_dismissed_at',
      dayjs().unix()
    );

    request(
      'PUT',
      endpoint('/api/v1/company_users/:id', { id: user.id }),
      user
    ).then((response: GenericSingleResourceResponse<CompanyUser>) => {
      set(user, 'company_user', response.data.data);

      $refetch(['company_users']);

      dispatch(updateUser(user));
      dispatch(resetChanges());
    });
  };

  const handleClick = () => {
    handleDismiss();
  };

  // // Don't show if not hosted
  // if (!isHosted()) {
  //   return null;
  // }

  // // Only show to owner
  // if (!isOwner) {
  //   return null;
  // }

  // // Only show in December 2025
  // const now = dayjs();
  // const isDecember2025 = now.year() === 2025 && now.month() === 11; // month is 0-indexed

  // if (!isDecember2025) {
  //   return null;
  // }

  return (
    <div className="max-w-max rounded-lg bg-[#DBEAFE] px-6 py-4 shadow-lg">
      <div className="flex items-center justify-center space-x-2">
        <span className="text-sm font-medium">{t('price_increase')}</span>

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
          className="cursor-pointer hover:opacity-80"
          onClick={handleDismiss}
        >
          <Icon element={MdClose} style={{ color: colors.$3 }} />
        </div>
      </div>
    </div>
  );
}
