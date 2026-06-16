/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Popover } from '@headlessui/react';
import { isHosted } from '$app/common/helpers';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { usePreventNavigation } from '$app/common/hooks/usePreventNavigation';
import { useTranslation } from 'react-i18next';
import { shouldDisplayAccountPlanExpiredBanner } from '$app/common/helpers/account-plan';

export function AccountPlanExpired() {
  const [t] = useTranslation();

  const account = useCurrentAccount();
  const user = useCurrentUser();
  const { isOwner } = useAdmin();
  const preventNavigation = usePreventNavigation();
  const forceDisplay =
    import.meta.env.VITE_SHOW_ACCOUNT_PLAN_EXPIRED_BANNER === 'true';

  if (
    !shouldDisplayAccountPlanExpiredBanner({
      forceDisplay,
      isHosted: isHosted(),
      isOwner,
      plan: account?.plan,
      planExpires: account?.plan_expires,
    })
  ) {
    return null;
  }

  const handlePayInvoice = () => {
    if (
      import.meta.env.VITE_ENABLE_NEW_ACCOUNT_MANAGEMENT ||
      !user?.company_user?.ninja_portal_url
    ) {
      preventNavigation({ url: '/settings/account_management/billing_history' });

      return;
    }

    if (user?.company_user?.ninja_portal_url) {
      preventNavigation({
        url: user.company_user.ninja_portal_url,
        externalLink: true,
      });
    }
  };

  return (
    <Popover className="relative">
      <div className="max-w-max rounded-lg bg-[#FCD34D] px-6 py-4 shadow-lg">
        <div className="flex flex-col items-start justify-center gap-2 sm:flex-row sm:items-center sm:space-x-2 sm:gap-0">
          <span className="text-sm">{t('account_plan_expired')}</span>

          <button
            type="button"
            className="cursor-pointer text-sm font-semibold underline hover:no-underline"
            onClick={handlePayInvoice}
          >
            {t('pay_now')}
          </button>
        </div>
      </div>
    </Popover>
  );
}
