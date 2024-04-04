/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtomValue } from 'jotai';
import { useUserChanges } from './useInjectUserChanges';
import { TableFiltersPreference } from './useReactSettings';
import { dataTableFiltersAtom } from './useStoreSessionTableFilters';

interface Params {
  tableKey: string;
}
export function useDataTablePreference(params: Params) {
  const user = useUserChanges();

  const { tableKey } = params;

  const storeSessionTableFilters = useAtomValue(dataTableFiltersAtom);

  return (filterKey: keyof TableFiltersPreference) => {
    if (filterKey === 'filter' || filterKey === 'currentPage') {
      return storeSessionTableFilters?.[tableKey]?.[filterKey]
        ? storeSessionTableFilters[tableKey][filterKey]
        : '';
    }

    const tableFilters = user?.company_user?.react_settings.table_filters;

    return tableFilters?.[tableKey]?.[filterKey]
      ? tableFilters[tableKey][filterKey]
      : '';
  };
}
