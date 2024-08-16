/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useSetAtom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { AsyncStorage } from 'jotai/vanilla/utils/atomWithStorage';

type SessionDataTableFilters = Record<string, Record<string, string | number>>;
const storage = createJSONStorage(() => sessionStorage);
export const dataTableFiltersAtom = atomWithStorage<SessionDataTableFilters>(
  'dataTableFilters',
  {},
  storage as AsyncStorage<SessionDataTableFilters>
);

interface Params {
  tableKey: string;
}
export function useStoreSessionTableFilters(params: Params) {
  const { tableKey } = params;

  const setDataTableFilters = useSetAtom(dataTableFiltersAtom);

  return (filter: string, currentPage: number) => {
    setDataTableFilters((current) => ({
      ...current,
      [tableKey]: {
        filter,
        currentPage,
      },
    }));
  };
}
