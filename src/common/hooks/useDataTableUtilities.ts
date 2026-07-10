/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import collect from 'collect.js';
import { SelectOption } from '$app/components/datatables/Actions';
import { useDataTableOptions } from './useDataTableOptions';
import { useDataTablePreference } from './useDataTablePreference';

interface Params {
  apiEndpoint: URL;
  isInitialConfiguration: boolean;
  tableKey: string | undefined;
  customFilters?: SelectOption[];
  defaultCustomFilterValues?: string[];
  customFilter?: string[] | undefined;
  withoutStoringPreferences?: boolean;
}
export function useDataTableUtilities(params: Params) {
  const options = useDataTableOptions();

  const {
    isInitialConfiguration,
    tableKey,
    customFilters,
    defaultCustomFilterValues,
    apiEndpoint,
    customFilter,
    withoutStoringPreferences,
  } = params;

  const getPreference = useDataTablePreference({ tableKey });

  const getDefaultOptions = () => {
    if (!isInitialConfiguration) {
      const preferenceStatuses = withoutStoringPreferences
        ? []
        : (getPreference('status') as string[]);

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
      const preferenceCustomFilters = withoutStoringPreferences
        ? []
        : (getPreference('customFilter') as string[]);

      const currentStatuses = preferenceCustomFilters?.length
        ? preferenceCustomFilters
        : (defaultCustomFilterValues ?? []);

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
        if (queryKey === 'status') {
          return;
        }

        const currentQueryKey = queryKey || 'client_status';
        const selectedFiltersByKey: string[] = [];
        const defaultFiltersByKey = (defaultCustomFilterValues ?? []).filter(
          (value) =>
            customFilters.some(
              (filter) =>
                (filter.queryKey || null) === queryKey && filter.value === value
            )
        );

        customFilters.forEach((filter, index) => {
          const customFilterQueryKey = filter.queryKey || null;

          if (
            customFilterQueryKey === queryKey &&
            customFilter?.includes(filter.value)
          ) {
            selectedFiltersByKey.push(filter.value);
          }

          if (index === customFilters.length - 1) {
            const filterValues = selectedFiltersByKey.length
              ? selectedFiltersByKey
              : defaultFiltersByKey;

            if (filterValues.length) {
              apiEndpoint.searchParams.set(
                currentQueryKey,
                filterValues.join(',')
              );
            } else {
              apiEndpoint.searchParams.delete(currentQueryKey);
            }
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
