/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Banner } from './Banner';
import { useTranslation } from 'react-i18next';
import { Link } from './forms';

export function CompanyActivationBanner() {
  const [t] = useTranslation();

  return (
    <Banner className="space-x-3">
      <span>{t('company_disabled_warning')}.</span>

      <div className="flex space-x-1">
        <Link
          className="font-medium text-xs md:text-sm text-blue-500 hover:underline cursor-pointer"
          to="/settings/account_management/overview"
        >
          {t('activate_company')}
        </Link>

        <span className="font-medium text-blue-500">&rarr;</span>
      </div>
    </Banner>
  );
}
