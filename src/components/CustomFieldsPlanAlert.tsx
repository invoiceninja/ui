/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { useTranslation } from 'react-i18next';
import { Alert } from './Alert';
import { Link } from './forms';
import CommonProps from '../common/interfaces/common-props.interface';
import { proPlan } from 'common/guards/guards/pro-plan';
import { enterprisePlan } from 'common/guards/guards/enterprise-plan';
import { isHosted } from 'common/helpers';

export function CustomFieldsPlanAlert(props: CommonProps) {
  const [t] = useTranslation();

  const user = useCurrentUser();

  const showAlert = !proPlan() && !enterprisePlan() && isHosted();

  return (
    <>
      {!showAlert && (
        <div className={`${props.className}`}>
          <Alert className="mb-4" type="warning" disableClosing>
            {t('custom_fields_upgrade_plan')}

            {user?.company_user && (
              <Link
                className="ml-10"
                external
                to={user.company_user.ninja_portal_url}
              >
                {t('plan_change')}
              </Link>
            )}
          </Alert>
        </div>
      )}
    </>
  );
}
