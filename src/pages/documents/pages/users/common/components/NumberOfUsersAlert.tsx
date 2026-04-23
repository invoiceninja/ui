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
import { useAtom } from 'jotai';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';
import { useTranslation } from 'react-i18next';
import { useUsersQuery as useDocuNinjaUsersQuery } from '$app/common/queries/docuninja/users';

export function NumberOfUsersAlert() {
  const [t] = useTranslation();

  // Get DocuNinja account data from unified atoms (NO QUERY!)
  const [docuData] = useAtom(docuNinjaAtom);
  const docuAccount = docuData?.account;
  
  // Get actual DocuNinja users count from API
  const { data: docuNinjaUsersData } = useDocuNinjaUsersQuery({ 
    perPage: '1', 
    currentPage: '1', 
    filter: '' 
  });
  
  const currentUserCount = docuNinjaUsersData?.data?.meta?.total || 0;
  const maxUsers = docuAccount?.num_users || 0;

  // Only show alert if user limit is reached
  if (currentUserCount < maxUsers || maxUsers <= 0) {
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
