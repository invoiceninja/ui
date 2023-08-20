/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Banner } from '../Banner';
import { Link } from 'react-router-dom';
import { buttonStyles } from './VerifyEmail';
import { isHosted } from '$app/common/helpers';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';

export function ActivateCompany() {
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const user = useCurrentUser();

  if (!isHosted()) {
    return null;
  }

  if (!company || !user?.email_verified_at) {
    return null;
  }

  if (company && !company.is_disabled) {
    return null;
  }

  return (
    <Banner variant="orange">
      <div className="flex space-x-1">
        <span>{t('company_disabled_warning')}.</span>

        <Link
          className={buttonStyles}
          to="/settings/account_management/overview"
        >
          {t('activate_company')}
        </Link>
      </div>
    </Banner>
  );
}
