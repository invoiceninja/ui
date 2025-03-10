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
import { Icon } from './icons/Icon';
import { useShouldDisableAdvanceSettings } from '$app/common/hooks/useShouldDisableAdvanceSettings';

interface Props extends CommonProps {
  message?: string;
}

export function AdvancedSettingsPlanAlert(props: Props) {
  const [t] = useTranslation();

  const user = useCurrentUser();

  const showPlanAlert = useShouldDisableAdvanceSettings();

  if (!showPlanAlert) {
    return <></>;
  }

  return (
    <div className={props.className}>
      <Alert className="mb-4" type="warning" disableClosing>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon element={MdInfoOutline} size={20} />

            <span>
              {props.message ? props.message : t('start_free_trial_message')}
            </span>
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
