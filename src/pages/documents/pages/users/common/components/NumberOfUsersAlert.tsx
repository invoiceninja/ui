/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Alert } from '$app/components/Alert';
import { Link } from '$app/components/forms';
import { docuCompanyAccountDetailsAtom } from '$app/pages/documents/Document';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

export function NumberOfUsersAlert() {
  const [t] = useTranslation();

  const docuCompanyAccountDetails = useAtomValue(docuCompanyAccountDetailsAtom);

  if (
    (docuCompanyAccountDetails?.account?.num_users || 0) <
    (docuCompanyAccountDetails?.account?.users || [])?.length
  ) {
    return null;
  }

  return (
    <Alert type="warning" className="mb-4" disableClosing>
      <div className="flex items-center gap-x-2 py-1.5">
        <span>{t('user_limit_reached')}</span>

        <Link to="/settings/account_management">{t('upgrade')}</Link>
      </div>
    </Alert>
  );
}
