/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createSelector } from '@reduxjs/toolkit';
import { isEqual } from 'lodash';
import { shallowEqual, useSelector } from 'react-redux';
import { Company } from '$app/common/interfaces/company.interface';
import { RootState } from '$app/common/stores/store';
import { useCompanyChanges } from './useCompanyChanges';

// Memoized selector using createSelector from Redux Toolkit
// This prevents re-renders when the company object hasn't actually changed
const selectCurrentCompany = createSelector(
  [
    (state: RootState) => state.companyUsers.api,
    (state: RootState) => state.companyUsers.currentIndex,
  ],
  (api, currentIndex) => api[currentIndex]?.company
);

export function useCurrentCompany(): Company {
  // Use the memoized selector with shallowEqual to prevent unnecessary re-renders
  // Only re-renders when the company object actually changes
  return useSelector(selectCurrentCompany, shallowEqual);
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
