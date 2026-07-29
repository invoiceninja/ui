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
import { useReactSettings } from './useReactSettings';
import collect from 'collect.js';

interface Params {
  apiEndpoint: URL;
  isInitialConfiguration: boolean;
  tableKey: string | undefined;
  customFilters?: SelectOption[];
  defaultCustomFilterValues?: string[];
  customFilter?: string[] | undefined;
  withoutStoringPreferences?: boolean;
  withFilterTextOnly?: boolean;
}
export function useDataTableUtilities(params: Params) {
  const options = useDataTableOptions();
  const reactSettings = useReactSettings();

  const {
    isInitialConfiguration,
    tableKey,
    customFilters,
    defaultCustomFilterValues,
    apiEndpoint,
    customFilter,
    withoutStoringPreferences,
    withFilterTextOnly,
  } = params;

  const getPreference = useDataTablePreference({ tableKey });

  // Server-persisted status/customFilter dropdowns are skipped when the table
  // opts out, only inherits the search text, or the global toggle is off.
  const withoutServerPreferences =
    withoutStoringPreferences ||
    withFilterTextOnly ||
    reactSettings.persist_table_filters === false;

  const getDefaultOptions = () => {
    if (!isInitialConfiguration) {
      const preferenceStatuses = withoutServerPreferences
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
      const preferenceCustomFilters = withoutServerPreferences
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
