/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { SelectOption } from '$app/components/datatables/Actions';
import { useDataTableOptions } from './useDataTableOptions';
import { useDataTablePreference } from './useDataTablePreference';
import collect from 'collect.js';

interface Params {
  apiEndpoint: URL;
  isInitialConfiguration: boolean;
  tableKey: string;
  customFilters?: SelectOption[];
  customFilter?: string[] | undefined;
}
export function useDataTableUtilities(params: Params) {
  const options = useDataTableOptions();

  const {
    isInitialConfiguration,
    tableKey,
    customFilters,
    apiEndpoint,
    customFilter,
  } = params;

  const getPreference = useDataTablePreference({ tableKey });

  const getDefaultOptions = () => {
    if (!isInitialConfiguration) {
      const preferenceStatuses = getPreference('status') as string[];

      const currentStatuses = preferenceStatuses?.length
        ? preferenceStatuses
        : ['active'];

      return (
        options.filter(({ value }) => currentStatuses.includes(value)) || [
          options[0],
        ]
      );
    }

    return undefined;
  };

  const getDefaultCustomFilterOptions = () => {
    if (!isInitialConfiguration && customFilters) {
      const preferenceCustomFilters = getPreference('customFilter') as string[];

      const currentStatuses = preferenceCustomFilters?.length
        ? preferenceCustomFilters
        : ['all'];

      return (
        customFilters.filter(({ value }) =>
          currentStatuses.includes(value)
        ) || [customFilters[0]]
      );
    }

    return undefined;
  };

  const handleChangingCustomFilters = () => {
    if (customFilters) {
      const queryKeys: string[] = collect(customFilters)
        .pluck('queryKey')
        .unique()
        .toArray();

      queryKeys.forEach((queryKey) => {
        const currentQueryKey = queryKey || 'client_status';
        const selectedFiltersByKey: string[] = [];

        customFilters.forEach((filter, index) => {
          const customFilterQueryKey = filter.queryKey || null;

          if (
            customFilterQueryKey === queryKey &&
            customFilter?.includes(filter.value)
          ) {
            selectedFiltersByKey.push(filter.value);
          }

          if (index === customFilters.length - 1) {
            apiEndpoint.searchParams.set(
              currentQueryKey,
              selectedFiltersByKey.join(',')
            );
          }
        });
      });
    }
  };

  return {
    defaultOptions: getDefaultOptions(),
    defaultCustomFilterOptions: getDefaultCustomFilterOptions(),
    handleChangingCustomFilters,
  };
}
