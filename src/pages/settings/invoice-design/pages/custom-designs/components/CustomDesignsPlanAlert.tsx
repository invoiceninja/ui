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
import { useTranslation } from 'react-i18next';
import { MdInfoOutline } from 'react-icons/md';
import { route } from '$app/common/helpers/route';
import { Alert } from '$app/components/Alert';
import { Link } from '$app/components/forms';
import { proPlan } from '$app/common/guards/guards/pro-plan';
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import CommonProps from '$app/common/interfaces/common-props.interface';

export function CustomDesignsPlanAlert(props?: CommonProps) {
  const [t] = useTranslation();

  const user = useCurrentUser();

  return (
    <>
      {!proPlan() && !enterprisePlan() && (
        <div className={props?.className}>
          <Alert className="mb-4" type="warning" disableClosing>
            <div className="flex items-center justify-between">
              <p className="inline-flex items-center space-x-1">
                <MdInfoOutline fontSize={18} />
                <span>{t('upgrade_to_paid_plan')}.</span>
              </p>

              {user?.company_user && (
                <Link
                  to={
                    user.company_user.ninja_portal_url ||
                    route('/settings/account_management')
                  }
                  className="ml-10"
                  external
                >
                  {t('plan_change')}
                </Link>
              )}
            </div>
          </Alert>
        </div>
      )}
    </>
  );
}
