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
import { Link } from 'react-router-dom';
import { Popover } from '@headlessui/react';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';

export const buttonStyles =
  'font-medium text-xs md:text-sm underline cursor-pointer';

export function ActivateCompany() {
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const user = useCurrentUser();

  if (!company || !user?.email_verified_at) {
    return null;
  }

  if (company && !company.is_disabled) {
    return null;
  }

  return (
    <Popover className="relative">
      <div className="max-w-max rounded-lg bg-[#FCD34D] px-6 py-4 shadow-lg">
        <div className="flex items-center justify-center space-x-1">
          <span className="text-sm">{t('company_disabled_warning')}.</span>

          <Link
            className="cursor-pointer text-sm font-semibold underline hover:no-underline"
            to="/settings/account_management/overview"
          >
            {t('activate_company')}
          </Link>
        </div>
      </div>
    </Popover>
  );
}
