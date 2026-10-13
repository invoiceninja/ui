/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { useShouldDisableAdvanceSettings } from '$app/common/hooks/useShouldDisableAdvanceSettings';
import { Alert } from '$app/components/Alert';
import { Link } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MdInfoOutline } from 'react-icons/md';
import { useHref } from 'react-router-dom';

export function UpgradeAlert() {
  const [t] = useTranslation();
  const user = useCurrentUser();
  const refreshCompanyUsers = useRefreshCompanyUsers();
  const showPlanAlert = useShouldDisableAdvanceSettings();
  const accountHref = useHref('/settings/account_management');

  useEffect(() => {
    if (!showPlanAlert) {
      return;
    }

    const onFocus = () => {
      void refreshCompanyUsers();
    };

    window.addEventListener('focus', onFocus);

    return () => window.removeEventListener('focus', onFocus);
  }, [showPlanAlert]);

  if (!showPlanAlert) {
    return null;
  }

  return (
    <Alert className="mb-4" type="warning" disableClosing>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Icon element={MdInfoOutline} size={20} />

          <span>{t('start_free_trial_message')}</span>
        </div>

        {user?.company_user ? (
          <Link
            to={accountHref}
            external
            withoutAdjustedHref
            withoutExternalIcon
          >
            {t('plan_change')}
          </Link>
        ) : null}
      </div>
    </Alert>
  );
}
