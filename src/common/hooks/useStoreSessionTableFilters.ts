/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atomWithStorage, createJSONStorage } from 'jotai/utils';

const storage = createJSONStorage(() => sessionStorage);
const dataTableFiltersAtom = atomWithStorage('dataTableFilters', {}, storage);

interface Params {
  tableKey: string;
}
export function useStoreSessionTableFilters(params: Params) {
  const { tableKey } = params;

  return (filter: string, currentPage: number) => {};
}
