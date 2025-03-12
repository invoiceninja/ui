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
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';

export function PEPPOLPlanBanner() {
  const [t] = useTranslation();

  const currentUser = useCurrentUser();

  const { isAdmin, isOwner } = useAdmin();

  if (
    enterprisePlan() ||
    !currentUser?.company_user?.ninja_portal_url ||
    (!isAdmin && !isOwner)
  ) {
    return null;
  }

  return (
    <Alert className="mb-4" type="warning" disableClosing>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div>
            <Icon element={MdInfoOutline} size={20} />
          </div>

          <span>{t('peppol_plan_warning')}</span>
        </div>

        {currentUser?.company_user && (
          <Link
            className="ml-10"
            external
            to={currentUser.company_user.ninja_portal_url}
          >
            {t('plan_change')}
          </Link>
        )}
      </div>
    </Alert>
  );
}
