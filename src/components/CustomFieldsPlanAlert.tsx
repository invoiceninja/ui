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
import { Alert } from './Alert';
import { Link } from './forms';
import CommonProps from '../common/interfaces/common-props.interface';
import { MdInfoOutline } from 'react-icons/md';
import { useShouldDisableCustomFields } from '$app/common/hooks/useShouldDisableCustomFields';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { route } from '$app/common/helpers/route';

export function CustomFieldsPlanAlert(props: CommonProps) {
  const [t] = useTranslation();

  const user = useCurrentUser();
  const disabled = useShouldDisableCustomFields();

  const { isAdmin } = useAdmin();

  return (
    <>
      {disabled && (
        <div className={props.className}>
          {!isAdmin && (
            <Alert className="mb-4" type="warning" disableClosing>
              <div className="flex items-center space-x-1">
                <MdInfoOutline fontSize={18} />
                <span>{t('not_allowed')}.</span>
              </div>
            </Alert>
          )}

          {isAdmin && (
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
          )}
        </div>
      )}
    </>
  );
}
