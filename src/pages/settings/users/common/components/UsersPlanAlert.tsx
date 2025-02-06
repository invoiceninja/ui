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
import { Alert } from '$app/components/Alert';
import { Link } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdInfoOutline } from 'react-icons/md';

export function UsersPlanAlert() {
  const [t] = useTranslation();

  const user = useCurrentUser();

  return (
    <div>
      <Alert className="mb-4" type="warning" disableClosing>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon element={MdInfoOutline} size={20} />

            <span>{t('add_users_not_supported')}</span>
          </div>

          {user?.company_user && (
            <Link external to={user.company_user.ninja_portal_url}>
              {t('plan_change')}
            </Link>
          )}
        </div>
      </Alert>
    </div>
  );
}
