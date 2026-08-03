/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { PerPage } from '$app/components/DataTable';

export interface ScopedTableFilters {
  filter?: string;
  customFilter?: string[];
  status?: string[];
  sort?: string;
  sortedBy?: string;
  perPage?: PerPage;
  currentPage?: number;
}

interface ScopedTableFiltersState {
  scopeId: string;
  tables: Record<string, ScopedTableFilters>;
}

export const scopedTableFiltersAtom = atom<ScopedTableFiltersState | null>(
  null
);

export function useRecordFiltersScope(scopeId: string | undefined) {
  const setScopedFilters = useSetAtom(scopedTableFiltersAtom);

  useEffect(() => {
    if (!scopeId) {
      return;
    }

    setScopedFilters((current) =>
      current?.scopeId === scopeId ? current : { scopeId, tables: {} }
    );

    return () => setScopedFilters(null);
  }, [scopeId]);
}

interface Params {
  tableKey: string | undefined;
}

export function useScopedTableFilters(params: Params) {
  const { tableKey } = params;

  const scopedFilters = useAtomValue(scopedTableFiltersAtom);
  const setScopedFilters = useSetAtom(scopedTableFiltersAtom);

  const scopeId = scopedFilters?.scopeId;
  const storedFilters = tableKey ? scopedFilters?.tables[tableKey] : undefined;

  const storeFilters = useMemo(
    () => (filters: ScopedTableFilters) => {
      if (!tableKey) {
        return;
      }

      setScopedFilters((current) =>
        current
          ? {
              ...current,
              tables: { ...current.tables, [tableKey]: filters },
            }
          : current
      );
    },
    [tableKey]
  );

  return { scopeId, storedFilters, storeFilters };
}
