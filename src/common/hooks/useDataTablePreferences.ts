/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { reactSettingsAtom } from './useReactSettings';
import { SelectOption } from '$app/components/datatables/Actions';
import { useDataTablePreference } from './useDataTablePreference';
import { PerPage } from '$app/components/DataTable';
import { isEqual } from 'lodash';
import { useStoreSessionTableFilters } from './useStoreSessionTableFilters';
import { useCurrentUser } from './useCurrentUser';
import {
  useReactSettings,
  useSaveReactSettings,
  useUpdateReactSettings,
} from './useReactSettings';

interface Params {
  apiEndpoint: URL;
  customFilters?: SelectOption[];
  defaultCustomFilterValues?: string[];
  tableKey: string | undefined;
  isInitialConfiguration: boolean;
  customFilter: string[] | undefined;
  setFilter: Dispatch<SetStateAction<string>>;
  setCustomFilter: Dispatch<SetStateAction<string[] | undefined>>;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setSort: Dispatch<SetStateAction<string>>;
  setSortedBy: Dispatch<SetStateAction<string | undefined>>;
  setStatus: Dispatch<SetStateAction<string[]>>;
  setPerPage: Dispatch<SetStateAction<PerPage>>;
  setArePreferencesApplied: Dispatch<SetStateAction<boolean>>;
  withoutStoringPerPage: boolean;
  enableSavingFilterPreference?: boolean;
  withoutStoringPage?: boolean;
  withoutStoringFilters?: boolean;
}

export function useDataTablePreferences(params: Params) {
  const user = useCurrentUser();
  const reactSettings = useReactSettings();
  const updateSettings = useUpdateReactSettings();
  const saveSettings = useSaveReactSettings();

  const {
    apiEndpoint,
    customFilters,
    defaultCustomFilterValues,
    tableKey,
    isInitialConfiguration,
    customFilter,
    setFilter,
    setCustomFilter,
    setCurrentPage,
    setSort,
    setSortedBy,
    setStatus,
    setPerPage,
    setArePreferencesApplied,
    withoutStoringPerPage,
    enableSavingFilterPreference,
    withoutStoringPage,
    withoutStoringFilters,
  } = params;

  const getPreference = useDataTablePreference({ tableKey });
  const storeSessionTableFilters = useStoreSessionTableFilters({ tableKey });

  const handleUpdateTableFilters = (
    filter: string,
    sortedBy: string | undefined,
    sort: string,
    currentPage: number,
    status: string[],
    perPage: PerPage
  ) => {
    if (tableKey) {
      storeSessionTableFilters(filter, currentPage);
    }

    if (!customFilter || !tableKey || !enableSavingFilterPreference) {
      return;
    }

    const currentTableFilters = reactSettings.table_filters?.[tableKey];
    const defaultCustomFilter = defaultCustomFilterValues ?? [];
    const currentCustomFilter = customFilter.length
      ? customFilter
      : defaultCustomFilter;

    const defaultFilters = {
      ...(customFilters && { customFilter: defaultCustomFilter }),
      sort: apiEndpoint.searchParams.get('sort') || 'id|asc',
      status: ['active'],
      ...(!withoutStoringPerPage && { perPage: '10' }),
      ...(!withoutStoringPage && { currentPage: 1 }),
    };

    const cleanedUpFilters = {
      ...(sortedBy && { sortedBy }),
      ...(customFilters && { customFilter: currentCustomFilter }),
      sort,
      status,
      ...(!withoutStoringPerPage && { perPage }),
      ...(!withoutStoringPage && { currentPage }),
    };

    if (isEqual(defaultFilters, cleanedUpFilters)) {
      if (currentTableFilters && user?.id) {
        const tableFilters = { ...(reactSettings.table_filters ?? {}) };

        Object.keys(tableFilters).forEach((key) => {
          if (key.includes('/')) {
            delete tableFilters[key];
          }
        });

        delete tableFilters[tableKey];
        saveSettings('table_filters', tableFilters);
      }

      return;
    }

    if (isEqual(currentTableFilters, cleanedUpFilters) && currentTableFilters) {
      return;
    }

    if (!user?.id) return;

    // Strip legacy URL-shaped table filter keys before persisting.
    const tableFilters = { ...(reactSettings.table_filters ?? {}) };
    Object.keys(tableFilters).forEach((key) => {
      if (key.includes('/')) {
        delete tableFilters[key];
      }
    });
    updateSettings('table_filters', tableFilters);
    saveSettings(`table_filters.${tableKey}`, cleanedUpFilters);
  };

  // Apply saved table preferences once per table key.
  const appliedRef = useRef<boolean>(false);
  useEffect(() => {
    appliedRef.current = false;
  }, [tableKey]);

  const rawAtom = useAtomValue(reactSettingsAtom);
  const isHydrated = rawAtom !== null;

  useEffect(() => {
    // Guards logout/unmount races where the atom has been reset to null.
    if (!isHydrated || appliedRef.current) return;

    if (!isInitialConfiguration) {
      setFilter((getPreference('filter') as string) || '');

      if (customFilters) {
        const preferenceCustomFilters = withoutStoringFilters
          ? []
          : (getPreference('customFilter') as string[]);

        if (preferenceCustomFilters.length) {
          setCustomFilter(preferenceCustomFilters);
        } else {
          setCustomFilter(defaultCustomFilterValues ?? []);
        }
      } else {
        setCustomFilter([]);
      }
      if (!withoutStoringPerPage) {
        setPerPage((getPreference('perPage') as PerPage) || '10');
      }
      if (!withoutStoringPage) {
        setCurrentPage((getPreference('currentPage') as number) || 1);
      }
      setSort(
        (getPreference('sort') as string) ||
          apiEndpoint.searchParams.get('sort') ||
          'id|asc'
      );
      setSortedBy((getPreference('sortedBy') as string) || undefined);
      if (
        !withoutStoringFilters &&
        (getPreference('status') as string[]).length
      ) {
        setStatus(getPreference('status') as string[]);
      } else {
        setStatus(['active']);
      }

      setArePreferencesApplied(true);
      appliedRef.current = true;
    }
  }, [isInitialConfiguration, isHydrated, tableKey]);

  return { handleUpdateTableFilters };
}
