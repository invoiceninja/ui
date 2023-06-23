/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Company } from '$app/common/interfaces/company.interface';
import { RootState } from '$app/common/stores/store';
import { useSelector } from 'react-redux';
import { useCompanyChanges } from './useCompanyChanges';
import { isEqual } from 'lodash';

export function useCurrentCompany(): Company {
  const companyUserState = useSelector(
    (state: RootState) => state.companyUsers
  );

  return companyUserState.api[companyUserState.currentIndex]?.company;
}

export function useShouldUpdateCompany() {
  const company = useCurrentCompany();
  const changes = useCompanyChanges();

  return () => {
    if (typeof changes === 'undefined') {
      return false;
    }

    return !isEqual(company, changes);
  };
}
