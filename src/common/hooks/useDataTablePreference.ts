/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useUserChanges } from './useInjectUserChanges';
import { TableFiltersPreference } from './useReactSettings';

interface Params {
  tableKey: string;
}
export function useDataTablePreference(params: Params) {
  const user = useUserChanges();

  const { tableKey } = params;

  return (filterKey: keyof TableFiltersPreference) => {
    const tableFilters = user?.company_user?.react_settings.table_filters;

    return tableFilters?.[tableKey]?.[filterKey]
      ? tableFilters[tableKey][filterKey]
      : '';
  };
}
