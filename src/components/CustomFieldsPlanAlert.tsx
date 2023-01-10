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
import { MdInfoOutline } from 'react-icons/md';
import { useShouldDisableCustomFields } from 'common/hooks/useShouldDisableCustomFields';

export function CustomFieldsPlanAlert(props: CommonProps) {
  const [t] = useTranslation();

  const user = useCurrentUser();

  const showAlert = useShouldDisableCustomFields();

  return (
    <>
      {showAlert && (
        <div className={props.className}>
          <Alert className="mb-4" type="warning" disableClosing>
            <div className="flex items-center">
              <MdInfoOutline className="mr-2" fontSize={20} />

              {t('upgrade_to_paid_plan')}

              {user?.company_user && (
                <Link
                  className="ml-10"
                  external
                  to={user.company_user.ninja_portal_url}
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
