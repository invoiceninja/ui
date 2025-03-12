/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { trans } from '$app/common/helpers';
import { useTranslation } from 'react-i18next';
import { Link } from './forms';
import { proPlan } from '$app/common/guards/guards/pro-plan';
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { route } from '$app/common/helpers/route';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';

export function RemoveLogoCTA() {
  const [t] = useTranslation();
  const user = useCurrentUser();

  const { isOwner } = useAdmin();

  if (!proPlan() && !enterprisePlan() && isOwner) {
    return (
      <div className="flex text-base space-x-1">
        <Link
          className="capitalize"
          to={
            user?.company_user?.ninja_portal_url ||
            route('/settings/account_management')
          }
          setBaseFont
          external={Boolean(user?.company_user?.ninja_portal_url)}
        >
          {t('click_here')}
        </Link>

        <span>
          {trans('pro_plan_remove_logo', {
            link: '',
          })}
          .
        </span>
      </div>
    );
  }

  return null;
}
