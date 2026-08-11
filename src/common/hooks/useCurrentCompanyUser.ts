/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useSelector } from 'react-redux';
import { CompanyUser } from '$app/common/interfaces/company-user';
import { RootState } from '$app/common/stores/store';

export function useCurrentCompanyUser(): CompanyUser | undefined {
  return useSelector(
    (state: RootState) =>
      state.companyUsers.api[state.companyUsers.currentIndex]
  );
}
